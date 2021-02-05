<template>
  <nav class="page-navigation">
    <div class="page-navigation__previous">
      <btn
        type="secondary"
        icon="arrow-left"
        icon-position="before"
        :to="previousPage.link"
        v-if="previousPage"
      >
        {{ previousPage.title }}
      </btn>
    </div>
    <div class="page-navigation__next">
      <btn
        type="secondary"
        icon="arrow-right"
        :to="nextPage.redirect || nextPage.link"
        v-if="nextPage"
      >
        {{ nextPage.title }}
      </btn>
    </div>
  </nav>
</template>

<script>
import linkGroups from '@/links.yaml'
import Btn from '~/components/Btn'

export default {
  components: {
    Btn,
  },

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
