<template>
  <div class="demo-page">
    <demo-content :name="$context.name" />
  </div>
</template>

<script>
import DemoContent from '~/components/DemoContent'

export default {
  components: {
    DemoContent,
  },

  metaInfo() {
    return {
      title: this.$context.name,
      meta: [
        {
          name: 'robots',
          content: 'noindex',
        },
      ],
    }
  },

  data() {
    return {
      resizeObserver: null,
    }
  },

  mounted() {
    this.resizeObserver = new window.ResizeObserver(() => {
      if (window.parentIFrame) {
        window.parentIFrame.sendMessage('resize')
      }
    })

    this.resizeObserver.observe(document.body)
  },

  beforeDestroy() {
    this.resizeObserver.unobserve(document.body)
  },
}
</script>

<style lang="scss" src="./style.scss" scoped></style>
