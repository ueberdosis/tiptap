<template>
  <nav class="page-navigation">
    <div class="page-navigation__previous">
      <g-link
        class="page-navigation__link"
        exact
        :to="previousPage.link"
        v-if="previousPage"
      >
        ← {{ previousPage.title }}
      </g-link>
    </div>
    <div class="page-navigation__next">
      <g-link
        class="page-navigation__link"
        exact
        :to="nextPage.link"
        v-if="nextPage"
      >
        {{ nextPage.title }} →
      </g-link>
    </div>
  </nav>
</template>

<script>
import linkGroups from '@/links.yaml'

export default {
  data() {
    return {
      linkGroups,
    }
  },

  computed: {
    items() {
      return this.linkGroups.reduce((acc, group) => (acc.push(...group.items), acc), [])
    },

    currentIndex() {
      return this.items.findIndex(item => {
        return item.link.replace(/\/$/, '') === this.$route.path.replace(/\/$/, '')
      })
    },

    nextPage() {
      return this.items[this.currentIndex + 1]
    },

    previousPage() {
      return this.items[this.currentIndex - 1]
    },
  },
}
</script>

<style lang="scss" src="./style.scss" scoped></style>
