<template>
  <Layout>
    <div class="doc-page">
      <VueRemarkContent class="doc-page__markdown" />
    </div>
  </Layout>
</template>

<page-query>
query($path: String!) {
  docPage(path: $path) {
    id
    title
    fileInfo {
      path
    }
  }
}
</page-query>

<script>
export default {
  metaInfo() {
    return {
      title: this.$page?.docPage?.title,
      meta: [
        /* OpenGraph */
        {
          property: 'og:title',
          content: this.$page?.docPage?.title,
        },
        /* Twitter */
        {
          name: 'twitter:title',
          content: this.$page?.docPage?.title,
        },
        {
          name: 'twitter:site',
          content: '@_ueberdosis',
        },
      ],
    }
  },
}
</script>

<style lang="scss" src="./style.scss" scoped></style>
