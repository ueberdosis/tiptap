<template>
  <div class="app">
    <header class="app__header">
      <div class="app__inner">
        <strong>
          <g-link to="/">{{ $static.metadata.siteName }}</g-link>
        </strong>
      </div>
    </header>
    <div class="app__content">
      <div class="app__inner">
        <div class="app__content-inner">
          <aside class="app__sidebar">
            <div v-for="edge in $static.allPost.edges" :key="edge.node.id">
              <g-link :to="edge.node.path">
                {{ edge.node.title }}
              </g-link>
            </div>
          </aside>
          <main class="app__main">
            <slot/>
          </main>
        </div>
      </div>
    </div>
  </div>
</template>

<static-query>
query {
  metadata {
    siteName
  }
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

<style lang="scss" src="./base.scss" />
<style lang="scss" src="./style.scss" scoped />