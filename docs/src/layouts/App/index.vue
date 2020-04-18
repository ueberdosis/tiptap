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
          <nav class="app__sidebar">
            <div class="app__link-group" v-for="(linkGroup, i) in linkGroups" :key="i">
              <div class="app__link-group-title">
                {{ linkGroup.title }}
              </div>
              <ul>
                <li v-for="(item, j) in linkGroup.items" :key="j">
                  <g-link class="app__link" :to="item.link">
                    {{ item.title }}
                  </g-link>
                </li>
              </ul>
            </div>
          </nav>
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
}
</static-query>

<script>
import linkGroups from '@/data/links.yaml'

export default {
  data() {
    return {
      linkGroups
    }
  }
}
</script>

<style lang="scss" src="./fonts.scss"></style>
<style lang="scss" src="./base.scss"></style>
<style lang="scss" src="./prism.scss"></style>
<style lang="scss" src="./style.scss" scoped></style>