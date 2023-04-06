<template>
  <div>
    <label
      >{{ label }}
      <textarea
        :value="content"
        @input="$emit('update:content', ($event.target as HTMLInputElement).value)"
        type="text"
      ></textarea>
    </label>
  </div>
</template>
<style scoped>
textarea {
  height: 180px;
  width: 100%;
  margin: 0 0 20px 0;
  background: rgba(45, 45, 45, 0.15);
  border-radius: 6px;
  border: 1px solid hsla(0, 0%, 100%, 0.15);
  box-shadow: inset 0 2px 3px 0 rgba(0, 0, 0, 0.1);
  color: #fff;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  font-size: 16px;
  vertical-align: top;
}
</style>
<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "TextArea",
  emits: ["update:content"],
  props: {
    content: {
      type: String,
      default: "",
    },
    label: {
      type: String,
      default: "",
    },
  },
});
</script>
