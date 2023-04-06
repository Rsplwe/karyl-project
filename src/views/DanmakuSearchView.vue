<template>
  <div class="mdui-row-xs-12">
    <TextEdit v-model:content="videoId" class="mdui-col-md-3" label="BV号 / AV号 / 番剧ID (EP/SS)"
      placeholder="BV1XX | av12345 | ss12345 | ep12345" />
    <TextEdit v-if="state.searchMode === SearchMode.KEYWORD" v-model:content="keyword" class="mdui-col-md-9"
      label="弹幕关键 字/词" placeholder="如: 前方高能 (留空加载全量弹幕)" />
    <TextEdit v-else-if="state.searchMode === SearchMode.UID" v-model:content="uid" class="mdui-col-md-9" label="用户UID"
      type="number" placeholder="如: 12345 (留空加载全量弹幕)" />
  </div>
  <div>
    <MduiButton :allow="!state.completeInputState || state.requestState" ripple raised class="mdui-m-r-1 mdui-m-b-1"
      color="theme-accent" v-on:click="loadPageList()">
      <MduiIcon :icon="MATERIAL_ICON_SEARCH" />&nbsp;查询
    </MduiButton>
    <MduiButton v-if="state.searchMode === SearchMode.KEYWORD" ripple raised class="mdui-m-r-1 mdui-m-b-1"
      color="orange-900" v-on:click="changeSearchMode(SearchMode.UID)">
      <MduiIcon :icon="MATERIAL_ICON_EXPLICIT" />&nbsp;切换为UID查询模式
    </MduiButton>
    <MduiButton v-else-if="state.searchMode === SearchMode.UID" ripple raised class="mdui-m-r-1 mdui-m-b-1"
      color="lime-900" v-on:click="changeSearchMode(SearchMode.KEYWORD)">
      <MduiIcon :icon="MATERIAL_ICON_EXPLICIT" />&nbsp;切换为关键字查询模式
    </MduiButton>
    <MduiButton ripple raised class="mdui-m-r-1 mdui-m-b-1" color="green-600" v-on:click="resetAll()">
      <MduiIcon :icon="MATERIAL_ICON_REFRESH" />&nbsp;重置
    </MduiButton>
    <MduiButton ripple raised class="mdui-m-r-1 mdui-m-b-1" color="deep-purple-500" v-on:click="showHelpDialog">
      <MduiIcon :icon="MATERIAL_ICON_INFO" />&nbsp;食用说明 （请务必要看）
    </MduiButton>
  </div>
  <p v-show="state.requestState">
    加载中，弹幕较多的情况下可能会消耗过长时间...
  </p>
  <br />
  <div>
    <MduiButton v-for="(item, i) in state.pageList" v-bind:key="i" v-on:click="loadDanmaku(item.srt)"
      class="mdui-m-r-1 mdui-m-b-1" color="blue-600" ripple :allow="item.srt === state.currentSelectPage" raised>
      分P{{ i + 1 }}: {{ item.name }}
    </MduiButton>
  </div>
  <br />
  <ResponsiveTable>
    <thead>
      <tr>
        <th>播放进度</th>
        <th>弹幕发送时间</th>
        <th>内容</th>
        <th>结果</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="(item, i) in state.danmakuList" v-bind:key="i">
        <td data-label="播放进度">{{ formatTime(item.playTime) }}</td>
        <td data-label="弹幕发送时间">{{ formatUnixTime(item.sendTime) }}</td>
        <td data-label="内容" style="word-break: break-all !important">
          {{ item.content }}
        </td>
        <td data-label="结果" class="mdui-text-color-pink-300">
          <div v-if="item.domState === DomState.RAW" v-on:click="trackUser(item.hash, i)">
            查看
          </div>
          <div v-else-if="item.domState === DomState.ANONYMOUS">匿名弹幕</div>
          <div v-else-if="item.domState === DomState.LOADING">加载中...</div>
          <div v-else-if="item.domState === DomState.FAILED" v-on:click="trackUser(item.hash, i)">
            获取失败
          </div>
          <div v-else-if="item.domState === DomState.UID" style="">
            <div v-for="(uid, j) in item.userId" v-bind:key="j">
              <a target="_blank" class="mdui-text-color-pink-300" :href="'https://space.bilibili.com/' + uid">{{
                uid
              }}</a>
            </div>
          </div>
        </td>
      </tr>
    </tbody>
  </ResponsiveTable>
</template>
<style scoped>

</style>
<script setup lang="ts">
import { ref, reactive, watch } from "vue";
import _crc32 from "crc32";
import { sortBy } from "lodash-es";
import ResponsiveTable from "@/components/elements/normal/ResponsiveTable.vue";
import TextEdit from "@/components/elements/normal/TextEdit.vue";
import MduiButton from "@/components/elements/mdui/MduiButton.vue";
import MduiIcon from "@/components/elements/mdui/MduiIcon.vue";

import {
  MATERIAL_ICON_SEARCH,
  MATERIAL_ICON_INFO,
  MATERIAL_ICON_REFRESH,
  MATERIAL_ICON_EXPLICIT,
} from "@/utils/MaterialIcons";
import { isValid, isBV, isBangumi, isEP } from "@/utils/IdCheck";
import { showDialog } from "@/utils/Dialog";
import { bv2av } from "@/utils/BIdTools";
import trackerWorker from "@/utils/Crc32?worker";
import {
  fetchBangumiPageList,
  fetchNormalPageList,
  fetchDanmakuList,
} from "@/api/video";

enum SearchMode {
  KEYWORD,
  UID,
}

enum DomState {
  RAW,
  ANONYMOUS,
  LOADING,
  UID,
  FAILED,
}

interface Page {
  name: string;
  srt: string;
}

interface Danmaku {
  playTime: number;
  content: string;
  hash: string;
  sendTime: number;
  domState: DomState;
  userId: string[];
}

interface responseDanmakuItem {
  content: string;
  hash: string;
  progress: number;
  time: number;
}

const state = reactive({
  searchMode: SearchMode.KEYWORD,
  completeInputState: false,
  requestState: false,
  pageList: <Page[]>[],
  danmakuList: <Danmaku[]>[],
  currentSelectPage: "",
});

const videoId = ref("");
const keyword = ref("");
const uid = ref("");

const worker = new trackerWorker();

function formatTime(time: number) {
  const h = Math.floor(time / 3600);
  const m = Math.floor((time % 3600) / 60);
  const s = Math.floor(time % 60);
  return `${h}:${m < 10 ? "0" + m : m}:${s < 10 ? "0" + s : s}`;
}

function formatUnixTime(time: number) {
  const _stamp = new Date(time * 1000);
  return _stamp.toLocaleString();
}

function changeSearchMode(mode: SearchMode) {
  state.searchMode = mode;
}

function resetAll() {
  if (state.requestState) {
    showDialog("Info", "请求进行中...");
    return;
  }
  state.searchMode = SearchMode.KEYWORD;
  state.pageList = [];
  state.danmakuList = [];
  state.currentSelectPage = "";

  uid.value = "";
  keyword.value = "";
  videoId.value = "";
}

function updateItemState(hash: string, content: string[]) {
  for (let index = 0; index < state.danmakuList.length; index++) {
    if (state.danmakuList[index].hash === hash) {
      state.danmakuList[index].userId = content;
      state.danmakuList[index].domState = DomState.UID;
    }
  }
}

function trackUser(hash: string, i: number) {
  if (hash === "f4dbdf21") {
    state.danmakuList[i].domState = DomState.ANONYMOUS;
    return;
  }

  state.danmakuList[i].domState = DomState.LOADING;

  worker.postMessage(hash);

  worker.onmessage = (_) => {
    updateItemState(_.data.hash, _.data.result);
  };

  worker.onerror = (_) => {
    showDialog("Error", _.message);
    state.danmakuList[i].domState = DomState.FAILED;
  }
}

async function loadPageList() {
  if (state.requestState) {
    return;
  }
  if (!state.completeInputState) {
    return;
  }

  if (!isValid(videoId.value)) {
    return;
  }

  if (!window.Worker) {
    showWorkerSupportCheckDialog();
    return;
  }

  if (!sessionStorage.getItem("isShowToS")) {
    showTOSDialog();
    sessionStorage.setItem("isShowToS", "true");
    return;
  }

  state.pageList = [];
  state.currentSelectPage = "";

  if (isBV(videoId.value)) {
    videoId.value = bv2av(videoId.value);
  }

  const reqId = videoId.value
    .replace("ss", "")
    .replace("ep", "")
    .replace("av", "");

  try {
    state.requestState = true;

    if (!isBangumi(videoId.value)) {
      const res = await fetchNormalPageList(parseInt(reqId));
      state.pageList = res.data.map((item: any) => {
        return <Page>{
          name: item.name,
          srt: item.srt,
        };
      });
    } else {
      const res = await fetchBangumiPageList(
        isEP(videoId.value) ? "ep" : "ss",
        parseInt(reqId)
      );
      state.pageList = res.data.map((item: any) => {
        return <Page>{
          name: item.name,
          srt: item.srt,
        };
      });
    }
  } catch (e) {
    showDialog("Error", (e as Error).message);
  } finally {
    state.requestState = false;
  }
}

async function loadDanmaku(selectId: string) {
  if (state.requestState) {
    return;
  }

  if (state.currentSelectPage === selectId) {
    return;
  }

  state.currentSelectPage = selectId;
  state.danmakuList = [];

  try {
    state.requestState = true;

    const res = await fetchDanmakuList(selectId);
    const temp: Danmaku[] = [];
    res.data.forEach((item: responseDanmakuItem) => {
      if (state.searchMode === SearchMode.KEYWORD) {
        if (item.content.indexOf(keyword.value) >= 0 || keyword.value === "") {
          temp.push(<Danmaku>{
            playTime: item.progress / 1000,
            sendTime: item.time,
            hash: item.hash,
            content: item.content,
            domState: DomState.RAW,
            userId: [],
          });
        }
      } else if (state.searchMode === SearchMode.UID) {
        if (_crc32(uid.value) === item.hash || uid.value === "") {
          temp.push(<Danmaku>{
            playTime: item.progress / 1000,
            sendTime: item.time,
            hash: item.hash,
            content: item.content,
            domState: DomState.RAW,
            userId: [],
          });
        }
      }
    });

    state.danmakuList = sortBy(temp, (item) => item.playTime);
  } catch (e) {
    showDialog("Error", (e as Error).message);
  } finally {
    state.requestState = false;
  }
}

function showTOSDialog() {
  const content =
    '<div class="mdui-typo">' +
    "在你使用本工具前，请注意：<br /><br />" +
    "本工具仅供研究学习所用，本站不对查询结果做任何保证。<br />" +
    "请在遵守本站服务条款以及您当地的法律法规的情况下使用本工具。<br />" +
    "本站<b>不提倡也不支持</b>任何通过本工具进行的「<b>开盒</b>」、「<b>挂人</b>」、「<b>查成分</b>」行为（但真要这么做我也拦不住），在本站的使用条款中，这属于违规行为。<br /><br />" +
    "<b>若您违规使用本工具，本站不会承担任何责任，违规使用所造成的任何后果，需您个人承担。</b>" +
    "</div>";
  showDialog("使用条款", content);
}

function showHelpDialog() {
  const content =
    '<div class="mdui-typo">' +
    "<p>1. 由于Hash冲突，可能会产生多个结果，排除掉0级和不存在的Uid就是正确的结果，如排除掉后仍有多个结果请自行判断</p>" +
    "<p>2. 影视、番剧和电影的视频ID一般都是ep或者ss开头的</p>" +
    "<p>3. 在点击查询按钮的时候会自动把bv号转换成av号</p>" +
    "</div>";
  showDialog("使用说明", content);
}

function showWorkerSupportCheckDialog() {
  const content =
    '<div class="mdui-typo">' +
    "您的浏览器不支持Web Worker特性，请更新浏览器或更换为Chrome、Firefox、Microsoft Edge等支持此特性的浏览器。" +
    "</div>";
  showDialog("Error", content);
}

watch(videoId, (newValue, oldValue) => {
  if (newValue === oldValue) {
    return;
  }
  state.completeInputState = isValid(videoId.value);
});
</script>
