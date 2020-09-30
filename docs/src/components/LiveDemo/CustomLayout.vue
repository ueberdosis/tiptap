<template>
  <div class="live-editor">
    <div class="live-editor__preview">
      <slot name="preview" />
    </div>
    <div class="live-editor__editor">
      <slot name="editor" />
    </div>
  </div>
</template>

<script>
export default {
  mounted() {
    let firstLoad = true
    const pre = this.$el.getElementsByClassName('prism-editor__editor')[0]
    const textarea = this.$el.getElementsByClassName('prism-editor__textarea')[0]

    const resizeObserver = new ResizeObserver(() => {
      const width = pre.scrollWidth
      const height = pre.scrollHeight
      textarea.style.width = `${width}px`
      textarea.style.height = `${height}px`

      if (!firstLoad) {
        textarea.blur()
        textarea.focus()
      }

      firstLoad = false
    })

    resizeObserver.observe(pre)

    this.$once('hook:beforeDestroy', () => {
      resizeObserver.unobserve(pre)
    })
  },
}
</script>

<style lang="scss" scoped>
.live-editor {
  background-color: $colorWhite;
  overflow: hidden;
  border-radius: 0.5rem;

  &__preview {
    padding: 1.5rem;
    border: 1px solid rgba($colorBlack, 0.1);
    border-top-left-radius: inherit;
    border-top-right-radius: inherit;
    border-bottom-width: 0;
  }

  &__editor {
    background-color: rgba($colorBlack, 0.9);
    color: rgba($colorWhite, 0.7);
  }

  &__editor ::v-deep {
    .prism-editor-wrapper {
      overflow: auto;
      max-height: unquote("max(300px, 60vh)");
      padding: 1.5rem;

      &::-webkit-scrollbar-thumb {
        background-color: rgba($colorWhite, 0.25);
      }
    }

    .prism-editor__container {
      position: relative;
    }

    .prism-editor__textarea {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      width: 100%;
      z-index: 1;
      resize: none;
      -webkit-text-fill-color: transparent;
      overflow: hidden;
    }
  }
}
</style>
