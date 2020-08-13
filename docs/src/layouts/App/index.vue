<template>
  <div class="app">
    <header class="app__header">
      <div class="app__header-inner">
        <g-link class="app__logo" to="/">
          {{ $static.metadata.siteName }}
        </g-link>
        <div>
          Algolia Search |
          Sponsor
          <github-button
            href="https://github.com/ueberdosis/tiptap"
            data-show-count="true"
            aria-label="Star ueberdosis/tiptap on GitHub"
          />
          <button
            class="app__menu-icon"
            @click="menuIsVisible = true"
            v-if="!menuIsVisible"
          >
            <icon name="menu" />
          </button>
          <button
            class="app__close-icon"
            @click="menuIsVisible = false"
            v-if="menuIsVisible"
          >
            <icon name="close" />
          </button>
        </div>
      </div>
    </header>
    <div class="app__content">
      <div class="app__sidebar-wrapper" :class="{ 'is-mobile-visible': menuIsVisible }">
        <select name="" id="">
          <option value="vue">Vue.js</option>
          <option value="react">React</option>
        </select>
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
      </div>
      <main class="app__main">
        <slot/>
        <p>
          <a :href="editLink" target="_blank">
            <span>Edit this page on GitHub</span>
          </a>
        </p>
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
import linkGroups from '@/links.yaml'
import Icon from '@/components/Icon'
import PageNavigation from '@/components/PageNavigation'
import GithubButton from 'vue-github-button'

export default {
  components: {
    Icon,
    PageNavigation,
    GithubButton,
  },

  data() {
    return {
      linkGroups,
      menuIsVisible: false,
    }
  },

  computed: {
    currentPath () {
      return this.$route.matched[0].path
    },
    editLink () {
      let path = this.currentPath

      if (path === '') {
        path = 'docs/src/pages/Index.vue'
      } else {
        path = `docs/src/docPages${path}.md`
      }

      return `https://github.com/ueberdosis/tiptap-next/blob/main/${path}`
    },
  }
}
</script>

<style lang="scss" src="./fonts.scss"></style>
<style lang="scss" src="./base.scss"></style>
<style lang="scss" src="./prism.scss"></style>
<style lang="scss" src="./style.scss" scoped></style>