<template>
  <Layout>

    <div v-for="edge in $static.allPost.edges" :key="edge.node.id">
      <g-link :to="edge.node.path">
        {{ edge.node.title }}
      </g-link>
    </div>

  </Layout>
</template>

<static-query>
query {
  allPost {
    edges {
      node {
        id
        title
        path
      }
    }
  }
}
</static-query>