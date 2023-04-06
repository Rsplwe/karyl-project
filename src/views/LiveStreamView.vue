<template>
  <div class="mdui-row-xs-12">
    <TextEdit
      class="mdui-col-md-12"
      v-model:content="liveRoomId"
      label="直播间ID"
      placeholder="12345"
    />
  </div>
  <div>
    <MduiButton
      :allow="!state.completeInputState || state.requestState"
      ripple
      raised
      class="mdui-m-r-1 mdui-m-b-1"
      color="theme-accent"
      v-on:click="getLiveStreamUrl()"
    >
      <MduiIcon :icon="MATERIAL_ICON_LINK" />&nbsp;获取
    </MduiButton>
    <MduiButton
      ripple
      raised
      class="mdui-m-r-1 mdui-m-b-1"
      color="green-600"
      v-on:click="resetAll"
    >
      <MduiIcon :icon="MATERIAL_ICON_REFRESH" />&nbsp;重置
    </MduiButton>
  </div>
  <p v-show="state.requestState">加载中...</p>
  <br />
  <div class="mdui-row-xs-12">
    <TextEdit
      class="mdui-col-md-12"
      v-model:content="state.streamList[i]"
      v-for="(item, i) in state.streamList"
      v-bind:key="i"
      :label="'线路 ' + (i + 1).toString()"
    />
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, watch } from "vue";
import TextEdit from "@/components/elements/normal/TextEdit.vue";
import MduiButton from "@/components/elements/mdui/MduiButton.vue";
import MduiIcon from "@/components/elements/mdui/MduiIcon.vue";
import { MATERIAL_ICON_LINK, MATERIAL_ICON_REFRESH } from "@/utils/MaterialIcons";
import { showDialog } from "@/utils/Dialog";
import { fetchLiveStream } from "@/api/live";

const state = reactive({
  requestState: false,
  completeInputState: false,
  streamList: <string[]>[],
});

const liveRoomId = ref("");

function resetAll() {
  if (state.requestState) {
    showDialog("Info", "请求进行中...");
    return;
  }

  liveRoomId.value = "";
  state.streamList = [];
}

async function getLiveStreamUrl() {
  if (state.requestState) {
    return;
  }

  if (!state.completeInputState) {
    return;
  }

  try {
    state.requestState = true;
    const res = fetchLiveStream(liveRoomId.value);
    state.streamList = (await res).data;
  } catch (e) {
    showDialog("Error", (e as Error).message);
  } finally {
    state.requestState = false;
  }
}

watch(liveRoomId, (newValue, oldValue) => {
  if (newValue === oldValue) {
    return;
  }
  state.completeInputState = /^\d+$/.test(liveRoomId.value);
});
</script>
