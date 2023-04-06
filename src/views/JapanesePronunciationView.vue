<template>
  <div class="mdui-row-xs-12">
    <TextArea v-model:content="originText" label="原文" />
  </div>
  <div>
    <MduiButton
      ripple
      raised
      color="deep-purple-500"
      class="mdui-m-r-1 mdui-m-b-1"
      :disabled="requestState"
      v-on:click="translate"
    >
      <MduiIcon :icon="MATERIAL_ICON_LOOP" />&nbsp;转换
    </MduiButton>
    <MduiButton
      ripple
      raised
      color="red"
      class="mdui-m-r-1 mdui-m-b-1"
      :disabled="!requestState"
      v-on:click="cancelRequest"
    >
      <MduiIcon :icon="MATERIAL_ICON_STOP" />&nbsp;停止
    </MduiButton>
    <MduiButton
      ripple
      raised
      color="green-600"
      class="mdui-m-r-1 mdui-m-b-1"
      :disabled="requestState"
      v-on:click="resetAll"
    >
      <MduiIcon :icon="MATERIAL_ICON_REFRESH" />&nbsp;重置
    </MduiButton>
  </div>
  <br />
  <div v-html="result"></div>
</template>
<script setup lang="ts">
import { ref } from "vue";
import TextArea from "@/components/elements/normal/TextArea.vue";
import MduiButton from "@/components/elements/mdui/MduiButton.vue";
import MduiIcon from "@/components/elements/mdui/MduiIcon.vue";
import {
  MATERIAL_ICON_LOOP,
  MATERIAL_ICON_REFRESH,
  MATERIAL_ICON_STOP,
} from "@/utils/MaterialIcons";
import { notate, lineToHtml } from "@/utils/janotator/janotator";
import { showDialog } from "@/utils/Dialog";

const originText = ref("");
const result = ref("");
const requestState = ref(false);
let controller = new AbortController();

const resetAll = () => {
  // requestState.value = false;
  originText.value = "";
  result.value = "";
};
const cancelRequest = () => {
  if (!requestState.value) {
    return;
  }

  controller.abort();
  requestState.value = false;
};
const translate = () => {
  if (requestState.value) {
    return;
  }

  requestState.value = true;
  controller = new AbortController();
  notate(originText.value, controller)
    .then((lines) => {
      result.value = "";
      lines.forEach((line) => {
        result.value += lineToHtml(line);
      });
    })
    .catch((err) => {
      if (!(err instanceof DOMException && err.code == DOMException.ABORT_ERR)) {
        showDialog("Failed", err);
      }
    })
    .finally(() => {
      requestState.value = false;
    });
};
</script>
