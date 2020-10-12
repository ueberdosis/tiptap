<template>
  <!-- <div class="app">
    <header class="app__header">
      <div class="app__header-inner">
        <g-link class="app__logo" to="/">
          {{ $static.metadata.siteName }}
        </g-link>
        <div>
          <input class="search" type="search" placeholder="Search">
          <a href="https://github.com/sponsors/ueberdosis">
            Sponsor
          </a>
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
        <nav class="app__sidebar">
          <div class="app__link-group" v-for="(linkGroup, i) in linkGroups" :key="i">
            <div class="app__link-group-title">
              {{ linkGroup.title }}
            </div>
            <ul class="app__link-list">
              <li v-for="(item, j) in linkGroup.items" :key="j">
                <g-link :class="{ 'app__link': true, 'app__link--draft': item.draft === true, 'app__link--with-children': item.items }" :to="item.link" :exact="item.link === '/'">
                  {{ item.title }}
                </g-link>

                <ul v-if="item.items" class="app__link-list">
                  <li v-for="(item, k) in item.items" :key="k">
                    <g-link :class="{ 'app__link': true, 'app__link--draft': item.draft === true }" :to="item.link" exact>
                      {{ item.title }}
                    </g-link>
                  </li>
                </ul>
              </li>
            </ul>
          </div>
        </nav>
      </div>
      <main class="app__main">
        <slot />
        <p>
          <br>
          <a :href="editLink" target="_blank">
            <span>Edit this page on GitHub</span>
          </a>
        </p>
        <p>
          Made with 🖤 by <a href="https://twitter.com/_ueberdosis">überdosis</a>
        </p>
        <page-navigation />
      </main>
    </div>
  </div> -->

  <div class="app">
    <div class="app__sidebar">
      <nav class="app__navigation">
        <div class="app__link-group" v-for="(linkGroup, i) in linkGroups" :key="i">
          <div class="app__link-group-title">
            {{ linkGroup.title }}
          </div>
          <ul class="app__link-list">
            <li v-for="(item, j) in linkGroup.items" :key="j">
              <g-link :class="{ 'app__link': true, 'app__link--draft': item.draft === true, 'app__link--with-children': item.items }" :to="item.link" :exact="item.link === '/'">
                {{ item.title }}
              </g-link>

              <ul v-if="item.items" class="app__link-list">
                <li v-for="(item, k) in item.items" :key="k">
                  <g-link :class="{ 'app__link': true, 'app__link--draft': item.draft === true }" :to="item.link" exact>
                    {{ item.title }}
                  </g-link>
                </li>
              </ul>
            </li>
          </ul>
        </div>
      </nav>
    </div>

    <div class="app__content">
      <div class="app__top-bar">
        <div class="app__inner">
          <input class="app__search" type="search" placeholder="Search">
        </div>
      </div>
      <div class="app__inner">
        <main class="app__main">
          <slot />
          <p>
            <br>
            <a :href="editLink" target="_blank">
              <span>Edit this page on GitHub</span>
            </a>
          </p>
          <p>
            Made with 🖤 by <a href="https://twitter.com/_ueberdosis">überdosis</a>
          </p>
          <page-navigation />
        </main>
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
    currentPath() {
      return this.$route.matched[0].path
    },
    editLink() {
      const { currentPath } = this
      const filePath = currentPath === '' ? '/introduction' : currentPath

      return `https://github.com/ueberdosis/tiptap-next/blob/main/docs/src/docPages${filePath}.md`
    },
  },

  methods: {
    initSearch() {
      // eslint-disable-next-line
      docsearch({
        apiKey: '1abe7fb0f0dac150d0e963d2eda930fe',
        indexName: 'ueberdosis_tiptap',
        inputSelector: '.app__search',
        debug: false,
      })
    },
  },

  mounted() {
    this.initSearch()
  },
}
</script>

<style lang="scss" src="./fonts.scss"></style>
<style lang="scss" src="./base.scss"></style>
<style lang="scss" src="./prism.scss"></style>
<style lang="scss" src="./style.scss" scoped></style>
