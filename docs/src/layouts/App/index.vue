<template>
  <div class="app">
    <div class="app__navigation">
      <div class="app__top-bar">
        <g-link class="app__logo" to="/">
          <img src="~@/assets/images/logo.svg">
        </g-link>

        <div class="app__menu">
          <span class="app__menu-item">
            Search
            <div class="app__search-docsearch" />
          </span>

          <portal-target name="desktop-menu" />
        </div>

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
      <div class="app__mobile-menu" v-if="menuIsVisible">
        <portal-target name="mobile-menu" />
        <portal-target name="mobile-sidebar" />
      </div>
    </div>

    <div class="app__content">
      <div class="app__sidebar" v-if="showSidebar">
        <portal-target name="desktop-sidebar" />
      </div>

      <main class="app__main">
        <div class="app__inner">
          <slot />
        </div>
      </main>

      <portal :to="menuPortal">
        <g-link class="app__menu-item" to="/overview/installation">
          Documentation
        </g-link>
        <g-link class="app__menu-item" to="https://github.com/ueberdosis/tiptap-next">
          GitHub
        </g-link>
      </portal>

      <portal :to="sidebarPortal" v-if="showSidebar">
        <nav class="app__sidebar-menu">
          <div class="app__link-group" v-for="(linkGroup, i) in linkGroups" :key="i">
            <div class="app__link-group-title">
              {{ linkGroup.title }}
            </div>
            <ul class="app__link-list">
              <li v-for="(item, j) in linkGroup.items" :key="j">
                <g-link
                  :class="{
                    'app__link': true,
                    'app__link--exact': $router.currentRoute.path === item.link,
                    'app__link--active': $router.currentRoute.path.startsWith(item.link),
                    [`app__link--${item.type}`]: item.type !== null,
                    'app__link--with-children': !!item.items
                  }"
                  :to="item.redirect || item.link"
                >
                  {{ item.title }}
                </g-link>

                <ul v-if="item.items" class="app__link-list">
                  <li v-for="(item, k) in item.items" :key="k">
                    <g-link
                      :class="{
                        'app__link': true,
                        'app__link--exact': $router.currentRoute.path === item.link,
                        'app__link--active': $router.currentRoute.path.startsWith(item.link),
                        [`app__link--${item.type}`]: item.type !== null,
                      }"
                      :to="item.link"
                      exact
                    >
                      {{ item.title }}
                    </g-link>
                  </li>
                </ul>
              </li>
            </ul>
          </div>
        </nav>
      </portal>
    </div>

    <footer class="app__footer">
      <a :href="editLink" target="_blank">Edit this page on GitHub</a>
      &middot;
      Made with 🖤 by <a href="https://twitter.com/_ueberdosis">überdosis</a>
      &middot;
      Based on <a href="https://prosemirror.net/">ProseMirror by Marijn Haverbeke</a>
    </footer>
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
// import GithubButton from 'vue-github-button'

export default {
  props: {
    showSidebar: {
      type: Boolean,
      default: true,
    },
  },

  components: {
    Icon,
    // GithubButton,
  },

  data() {
    return {
      linkGroups,
      menuIsVisible: false,
      windowWidth: null,
    }
  },

  computed: {
    menuPortal() {
      if (this.windowWidth && this.windowWidth < 800) {
        return 'mobile-menu'
      }

      return 'desktop-menu'
    },

    sidebarPortal() {
      if (this.windowWidth && this.windowWidth < 800) {
        return 'mobile-sidebar'
      }

      return 'desktop-sidebar'
    },

    currentPath() {
      return this.$route.matched[0].path
    },

    editLink() {
      const { currentPath } = this

      if (process.env.NODE_ENV === 'development') {
        if (currentPath === '') {
          return `vscode://file${this.cwd}/src/pages/index.vue`
        }

        return `vscode://file${this.cwd}/src/docPages${currentPath}.md`
      }

      if (currentPath === '') {
        return 'https://github.com/ueberdosis/tiptap-next/blob/main/docs/src/pages/index.vue'
      }

      return `https://github.com/ueberdosis/tiptap-next/blob/main/docs/src/docPages${currentPath}.md`
    },
  },

  watch: {
    $route() {
      this.menuIsVisible = false
    },

    windowWidth() {
      this.menuIsVisible = false
    },
  },

  methods: {
    initSearch() {
      // eslint-disable-next-line
      docsearch({
        apiKey: '1abe7fb0f0dac150d0e963d2eda930fe',
        indexName: 'ueberdosis_tiptap',
        container: '.app__search-docsearch',
        debug: false,
      })
    },

    handleResize() {
      this.windowWidth = window.innerWidth
    },
  },

  mounted() {
    // what the hell is wrong with iOS safari
    setTimeout(() => {
      this.handleResize()
      this.initSearch()
    }, 0)

    window.addEventListener('resize', this.handleResize)
  },

  beforeDestroy() {
    window.removeEventListener('resize', this.handleResize)
  },
}
</script>

<style lang="scss" src="./fonts.scss"></style>
<style lang="scss" src="./base.scss"></style>
<style lang="scss" src="./prism.scss"></style>
<style lang="scss" src="./style.scss" scoped></style>
