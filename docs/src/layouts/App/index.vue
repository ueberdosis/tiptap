<template>
  <div class="app">
    <div class="app__sidebar">
      <div class="app__title">
        <g-link class="app__name" to="/">
          {{ $static.metadata.siteName }}
        </g-link>
        <g-link to="https://github.com/ueberdosis/tiptap-next">
          <svg
            class="app__github"
            width="15"
            height="15"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 15 15"
          ><path
            d="M7.49936 0.849976C3.82767 0.849976 0.849976 3.82727 0.849976 7.5002C0.849976 10.4379 2.75523 12.9306 5.39775 13.8103C5.73047 13.8712 5.85171 13.6658 5.85171 13.4895C5.85171 13.3315 5.846 12.9134 5.84273 12.3586C3.99301 12.7603 3.60273 11.467 3.60273 11.467C3.30022 10.6987 2.86423 10.4942 2.86423 10.4942C2.26044 10.0819 2.90995 10.0901 2.90995 10.0901C3.57742 10.137 3.9285 10.7755 3.9285 10.7755C4.52167 11.7916 5.48512 11.4981 5.86396 11.3278C5.92438 10.8984 6.09625 10.6052 6.28608 10.4391C4.80948 10.2709 3.25695 9.7006 3.25695 7.15238C3.25695 6.42612 3.51618 5.83295 3.94157 5.36797C3.87299 5.19977 3.64478 4.52372 4.00689 3.60804C4.00689 3.60804 4.56494 3.42923 5.83538 4.28938C6.36568 4.14201 6.93477 4.06853 7.50018 4.06567C8.06518 4.06853 8.63386 4.14201 9.16498 4.28938C10.4346 3.42923 10.9918 3.60804 10.9918 3.60804C11.3548 4.52372 11.1266 5.19977 11.0584 5.36797C11.4846 5.83295 11.7418 6.42612 11.7418 7.15238C11.7418 9.70713 10.1868 10.2693 8.70571 10.4338C8.94412 10.6391 9.15681 11.0449 9.15681 11.6654C9.15681 12.5542 9.14865 13.2715 9.14865 13.4895C9.14865 13.6675 9.26867 13.8744 9.60588 13.8095C12.2464 12.9281 14.15 10.4375 14.15 7.5002C14.15 3.82727 11.1723 0.849976 7.49936 0.849976Z"
            fill="currentColor"
            fill-rule="evenodd"
            clip-rule="evenodd"
          /></svg>
        </g-link>
      </div>

      <portal-target name="desktop-nav" />
    </div>

    <div class="app__content">
      <div class="app__top-bar">
        <div class="app__inner app__top-bar-inner">
          <div class="app__search">
            <div class="app__search-button" />
            <div class="app__search-docsearch" />
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
        <div class="app__mobile-nav" v-if="menuIsVisible">
          <portal-target name="mobile-nav" />
        </div>
      </div>
      <main class="app__main">
        <div class="app__inner">
          <slot />
        </div>
      </main>
      <div class="app__page-navigation">
        <div class="app__inner">
          <page-navigation />
        </div>
      </div>
      <div class="app__page-footer">
        <div class="app__inner">
          <a :href="editLink" target="_blank">Edit this page on GitHub</a>
          &middot;
          <a href="/impressum">Impressum</a>
          &middot;
          <a href="/privacy-policy">Privacy Policy</a>
          &middot;
          Made with 🖤 by <a href="https://twitter.com/_ueberdosis">überdosis</a>
        </div>
      </div>
    </div>

    <portal :to="portal">
      <nav class="app__navigation">
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
// import GithubButton from 'vue-github-button'

export default {
  components: {
    Icon,
    PageNavigation,
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
    portal() {
      if (this.windowWidth && this.windowWidth < 800) {
        return 'mobile-nav'
      }

      return 'desktop-nav'
    },

    currentPath() {
      return this.$route.matched[0].path
    },

    editLink() {
      const { currentPath } = this
      const filePath = currentPath === '' ? '/introduction' : currentPath

      if (process.env.NODE_ENV === 'development') {
        return `vscode://file${this.cwd}/src/docPages${filePath}.md`
      }

      return `https://github.com/ueberdosis/tiptap-next/blob/main/docs/src/docPages${filePath}.md`
    },
  },

  watch: {
    $route() {
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
    this.initSearch()
    this.handleResize()

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
