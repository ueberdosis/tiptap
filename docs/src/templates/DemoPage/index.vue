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
}
</script>

<style lang="scss" src="./style.scss" scoped></style>
