<template>
  <div class="demo-page">
    <demo :name="$context.name" v-bind="props" />
  </div>
</template>

<script>
export default {
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
}
</script>

<style lang="scss" src="./style.scss" scoped></style>
