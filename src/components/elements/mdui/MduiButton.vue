<template>
  <button
    class="mdui-btn"
    :class="mduiClass"
    :disabled="disabled"
    @mouseenter="$emit('mouseenter', $event)"
    @mouseleave="$emit('mouseleave', $event)"
  >
    <slot />
  </button>
</template>
<script lang="ts">
import { defineComponent } from "vue";
export default defineComponent({
  name: "MduiButton",
  props: {
    // 涟漪动画效果
    ripple: Boolean,
    // 浮动按钮
    raised: Boolean,
    // 图标按钮
    icon: Boolean,
    // 密集型按钮
    dense: Boolean,
    // 块级元素
    block: Boolean,
    allow: Boolean,
    // 禁用状态
    disabled: Boolean,
    // 背景颜色 mdui-color-[color]
    color: String,
    // 文本颜色 mdui-text-color-[textColor]
    textColor: String,
  },
  computed: {
    mduiClass() {
      const c: { [k: string]: boolean } = {
        "mdui-ripple": this.ripple,
        "mdui-btn-raised": this.raised,
        "mdui-btn-icon": this.icon,
        "mdui-btn-dense": this.dense,
        "mdui-btn-block": this.block,
      };
      if (this.color) {
        if (this.allow) {
          c["mdui-color-grey-600"] = true;
        } else {
          c[`mdui-color-${this.color}`] = true;
        }
      }
      if (this.textColor) {
        c[`mdui-text-color-${this.textColor}`] = true;
      }
      return c;
    },
  },
});
</script>
