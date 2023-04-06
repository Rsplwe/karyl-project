<template>
  <div>
    如果您觉得本站对你有帮助的话，您可以通过赞助这个项目来维持这个项目的开销（服务器、CDN、域名
    等）以及
    <del>Coffee 、KFC Crazy Thursday</del>。
  </div>
  <br />
  <MduiButton
    v-on:click="showQrCode('wechat')"
    class="mdui-m-r-1 mdui-m-b-1"
    raised
    color="green-600"
  >
    <i class="mdui-icon material-icons">
      <WeChatIcon />
    </i>
    &nbsp;微信支付二维码
  </MduiButton>
  <MduiButton
    v-on:click="showQrCode('alipay')"
    class="mdui-m-r-1 mdui-m-b-1"
    raised
    style="background-color: #1878ff"
  >
    <i class="mdui-icon material-icons">
      <img style="width: 24px; height: 24px" :src="AliPayIcon" />
    </i>
    &nbsp;支付宝二维码
  </MduiButton>
</template>
<script setup lang="ts">
import { Fancybox } from "@fancyapps/ui";
import MduiButton from "@/components/elements/mdui/MduiButton.vue";
import AliPayIcon from "@/assets/Icon/AliPay.png";
import WeChatIcon from "@/assets/Icon/WeChat.vue";

import PayCodeAliPay from "@/assets/PayQrCode/AliPay.png";
import PayCodeWeChat from "@/assets/PayQrCode/WechatPay.png";

function showQrCode(service: string) {
  switch (service) {
    case "alipay":
      Fancybox.show([
        {
          src: PayCodeAliPay,
          type: "image",
          preload: false,
        },
      ]);
      break;
    case "wechat":
      Fancybox.show([
        {
          src: PayCodeWeChat,
          type: "image",
          preload: false,
        },
      ]);
      break;
    default:
      break;
  }
}
</script>

<style lang="scss">
@import "@fancyapps/ui/dist/fancybox/fancybox.css";
</style>
