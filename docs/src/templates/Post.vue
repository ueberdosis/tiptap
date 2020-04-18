<template>
  <Layout>
    <h1>{{ $page.post.title }}</h1>
    <VueRemarkContent />
  </Layout>
</template>

<page-query>
query Post ($id: ID!) {
  post(id: $id) {
    title
  }
}
</page-query>