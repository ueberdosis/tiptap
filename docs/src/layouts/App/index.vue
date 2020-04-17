<template>
  <div class="app">
    <header class="app__header">
      <div class="app__inner">
        <g-link class="app__logo" to="/">
          {{ $static.metadata.siteName }}
        </g-link>
      </div>
    </header>
    <div class="app__content">
      <div class="app__inner">
        <div class="app__content-inner">
          <aside class="app__sidebar">
            <ul>
              <li v-for="edge in $static.allPost.edges" :key="edge.node.id">
                <g-link class="app__link" :to="edge.node.path">
                  {{ edge.node.title }}
                </g-link>
              </li>
            </ul>
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

<style lang="scss" src="./fonts.scss"></style>
<style lang="scss" src="./base.scss" />
<style lang="scss" src="./style.scss" scoped />