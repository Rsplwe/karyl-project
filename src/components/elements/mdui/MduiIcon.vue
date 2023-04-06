<template>
  <i class="mdui-icon material-icons" v-html="icon"></i>
</template>
<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "MduiIcon",
  props: {
    icon: String,
  },
});
</script>
