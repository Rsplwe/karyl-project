<template>
  <br />
  <div class="mdui-typo">
    <div class="mdui-card" style="background-color: rgba(255, 255, 255, 0.75) !important">
      <div class="mdui-card-primary">
        <div class="mdui-card-primary-title">ようこそ!</div>
        <div class="mdui-card-primary-subtitle">
          あなたは
          <span class="guest-number">{{ guestNumber }}</span>
          人目の訪問者です
        </div>
      </div>
      <div class="mdui-card-content">
        <div>
          <div>手机用户请点击<b>左上角</b>的按钮来切换工具</div>
        </div>
        <br />
        友情链接
        <ul>
        </ul>
        <br />
        <div>
          <div>目前的待开发功能 (时间不定)</div>
          <div>1. 弹幕下载 &amp;&amp; ASS字幕格式</div>
          <div>
            <del>2. 重新设计页面</del>
          </div>
          <div>
            <del>3. 番剧和影视资源的查询</del>
          </div>
          <div>4. vtuber 排行榜</div>
          <div>5. 图片混淆 &amp;&amp; 反混淆</div>
          <div>6. 视频下载 (可能需要做成客户端)</div>
        </div>
        <br />
        <div>
          <div>Rsplwe</div>
          <div>2022/3/6</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref } from "vue";
import { randomGuestNumber } from "@/utils/GuestNumber";
import newYearChara from "@/assets/Event/NewYear/chara3.png";

const guestNumber = ref("0000000");

onMounted(() => {
  guestNumber.value = "00" + randomGuestNumber().toString();
});
</script>

<style scoped>
.guest-number {
  background: #000;
  color: #fff;
  font-weight: bold;
}
</style>
