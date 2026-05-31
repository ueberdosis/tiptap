<template>
  <button class="decoration-counter" @click="count += 1">¶ {{ index + 1 }} · 👍 {{ count }}</button>
</template>

<script>
export default {
  // editor / view / getPos are passed through as props by VueWidgetRenderer;
  // we don't render them as attributes on the root element.
  inheritAttrs: false,

  props: {
    index: {
      type: Number,
      default: 0,
    },
  },

  data() {
    return {
      count: 0,
    }
  },
}
</script>
