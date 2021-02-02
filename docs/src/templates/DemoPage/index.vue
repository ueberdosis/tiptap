<template>
  <div class="demo-page">
    <demo-content :name="$context.name" v-bind="props" />
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

  methods: {
    fromString(value) {
      if (typeof value !== 'string') {
        return value
      }

      if (value.match(/^\d*(\.\d+)?$/)) {
        return Number(value)
      }

      if (value === 'true') {
        return true
      }

      if (value === 'false') {
        return false
      }

      if (value === 'null') {
        return null
      }

      return value
    },
  },

  computed: {
    props() {
      return Object.fromEntries(Object
        .entries(this.$route.query)
        .map(([key, value]) => [key, this.fromString(value)]))
    },
  },

  mounted() {
    this.resizeObserver = new window.ResizeObserver(items => {
      if (window.parentIFrame) {
        window.parentIFrame.sendMessage({
          type: 'resize',
          height: items[0].contentRect.height,
        })
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
