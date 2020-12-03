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
        :to="nextPage.redirect || nextPage.link"
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
      return this.linkGroups.reduce((acc, group) => ((acc.push(...group.items), acc)), [])
    },

    flattenedItems() {
      const flattenedItems = []

      this.items.forEach(({
        title,
        link,
        redirect,
        items,
      }) => {
        flattenedItems.push({
          title,
          link,
          redirect,
        })

        if (items) {
          items.forEach(child => {
            flattenedItems.push(child)
          })
        }
      })

      return flattenedItems
    },

    currentIndex() {
      return this.flattenedItems.findIndex(item => {
        return item.link.replace(/\/$/, '') === this.$route.path.replace(/\/$/, '')
      })
    },

    nextPage() {
      let nextIndex = this.currentIndex + 1

      while (this.flattenedItems[nextIndex]?.skip) {
        nextIndex += 1
      }

      return this.flattenedItems[nextIndex]
    },

    previousPage() {
      let previousIndex = this.currentIndex - 1

      while (this.flattenedItems[previousIndex]?.redirect) {
        previousIndex -= 1
      }

      return this.flattenedItems[previousIndex]
    },
  },
}
</script>

<style lang="scss" src="./style.scss" scoped></style>
