<template>
  <div class="demo-page">
    <demo :name="$context.name" :show-source="false" inline />
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
}
</script>

<style lang="scss" src="./style.scss" scoped></style>
