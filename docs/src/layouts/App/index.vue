<template>
  <div class="app">
    <header class="app__header">
      <g-link class="app__logo" to="/">
        {{ $static.metadata.siteName }}
      </g-link>
      <github-button
        href="https://github.com/scrumpy/tiptap"
        data-show-count="true"
        aria-label="Star scrumpy/tiptap on GitHub"
      />
    </header>
    <div class="app__content">
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
        <page-navigation />
      </main>
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
import PageNavigation from '@/components/PageNavigation'
import GithubButton from 'vue-github-button'

export default {
  components: {
    PageNavigation,
    GithubButton,
  },

  data() {
    return {
      linkGroups,
    }
  },
}
</script>

<style lang="scss" src="./fonts.scss"></style>
<style lang="scss" src="./base.scss"></style>
<style lang="scss" src="./prism.scss"></style>
<style lang="scss" src="./style.scss" scoped></style>