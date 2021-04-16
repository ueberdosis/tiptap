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
        <slot />
      </main>

      <portal :to="menuPortal">
        <g-link class="app__menu-item" to="/installation">
          Documentation
        </g-link>
        <g-link class="app__menu-item" to="https://github.com/ueberdosis/tiptap-next">
          GitHub
        </g-link>
      </portal>

      <portal :to="sidebarPortal">
        <nav class="app__sidebar-menu">
          <div class="app__link-group" v-for="(linkGroup, i) in linkGroups" :key="i">
            <template v-if="linkGroup.link && !linkGroup.items">
              <g-link
                class="app__link-group__link"
                :to="linkGroup.redirect || linkGroup.link"
              >
                {{ linkGroup.title }}
              </g-link>
            </template>
            <template v-else>
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
            </template>
          </div>
        </nav>
      </portal>
    </div>

    <page-footer />
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
import PageFooter from '@/components/PageFooter'
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
    PageFooter,
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
      if (!this.windowWidth) {
        return
      }

      if (this.windowWidth < 800) {
        return 'mobile-menu'
      }

      return 'desktop-menu'
    },

    sidebarPortal() {
      if (!this.windowWidth) {
        return
      }

      if (this.windowWidth < 800) {
        return 'mobile-sidebar'
      }

      return 'desktop-sidebar'
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
    }, 10)

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
