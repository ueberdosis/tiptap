<template>
  <div class="demos" :class="{ 'is-first-active': selectedIndex === 0 }">
    <button
      class="demos__tab"
      :class="{ 'is-active': selectedIndex === index }"
      v-for="(item, index) in formattedItems"
      :key="index"
      @click="selectedIndex = index"
    >
      {{ item.title }}
    </button>
    <demo
      :name="selectedItem.name"
      :key="selectedItem.title"
    />
  </div>
</template>

<script>
import Demo from '@/components/Demo'

export default {
  components: {
    Demo,
  },

  props: {
    items: {
      type: Object,
      required: true,
    },
  },

  data() {
    return {
      selectedIndex: 0,
    }
  },

  computed: {
    formattedItems() {
      return Object
        .entries(this.items)
        .map(([title, name]) => {
          return {
            title,
            name,
          }
        })
    },

    selectedItem() {
      return this.formattedItems[this.selectedIndex]
    },
  },
}
</script>

<style lang="scss" scoped>
.demos {
  &__tab {
    border-radius: 0.4rem 0.4rem 0 0;
    border: none;
    background: none;
    padding: 0.3rem 1.25rem;
    font: inherit;
    font-weight: 700;
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.025rem;

    &.is-active {
      background-color: $colorBlack;
      color: $colorWhite;
      font-weight: 700;
    }
  }

  &.is-first-active ::v-deep .demo {
    border-top-left-radius: 0;
  }
}
</style>
