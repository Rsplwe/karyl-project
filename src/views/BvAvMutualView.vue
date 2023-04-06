<template>
  <div class="mdui-row-xs-12">
    <TextEdit
      class="mdui-col-md-6"
      title="BV号"
      v-model:content="bvText"
      placeholder="请输入BV号"
    >
    </TextEdit>
    <TextEdit
      class="mdui-col-md-6"
      title="AV号"
      v-model:content="avText"
      placeholder="请输入AV号"
    >
    </TextEdit>
  </div>
</template>

<script lang="ts" setup>
import { ref, watch } from "vue";
import TextEdit from "@/components/elements/normal/TextEdit.vue";
import { av2bv, bv2av } from "@/utils/BIdTools";
import { isAV, isBV } from "@/utils/IdCheck";

const avText = ref("");
const bvText = ref("");

watch(avText, (newValue, oldValue) => {
  if (newValue === oldValue) {
    return;
  }
  if (isAV(avText.value)) {
    bvText.value = av2bv(avText.value);
  }
});

watch(bvText, (newValue, oldValue) => {
  if (newValue === oldValue) {
    return;
  }
  if (isBV(bvText.value)) {
    avText.value = bv2av(bvText.value);
  }
});
</script>
