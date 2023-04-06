<template>
  <div>
    <label
      >{{ label }}
      <input
        v-bind:disabled="disable"
        :value="content"
        @input="$emit('update:content', ($event.target as HTMLInputElement).value)"
        :placeholder="placeholder"
        :type="type"
        autocomplete="off"
      />
    </label>
  </div>
</template>
<style scoped>
input {
  height: 35px;
  width: 100%;
  margin: 0 0 20px 0;
  background: rgba(45, 45, 45, 0.15);
  -moz-border-radius: 6px;
  -webkit-border-radius: 6px;
  border-radius: 6px;
  border: 1px solid rgba(255, 255, 255, 0.15);
  -moz-box-shadow: 0 2px 3px 0 rgba(0, 0, 0, 0.1) inset;
  -webkit-box-shadow: 0 2px 3px 0 rgba(0, 0, 0, 0.1) inset;
  box-shadow: 0 2px 3px 0 rgba(0, 0, 0, 0.1) inset;
  font-size: 14px;
  color: #fff;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  -o-transition: all 0.2s;
  -moz-transition: all 0.2s;
  -webkit-transition: all 0.2s;
  -ms-transition: all 0.2s;
  transition: all 0.2s;
}

input:-moz-placeholder {
  color: #9a9a9a;
}

input:-ms-input-placeholder {
  color: #9a9a9a;
}

input::-webkit-input-placeholder {
  color: #9a9a9a;
}
</style>
<script lang="ts">
import { defineComponent } from "vue";
export default defineComponent({
  name: "TextEdit",
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
    type: {
      type: String,
      default: "text",
    },
    placeholder: {
      type: String,
      default: "",
    },
    disable: {
      type: Boolean,
      default: false,
    },
  },
});
</script>
