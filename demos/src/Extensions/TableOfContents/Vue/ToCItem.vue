<template>
  <div
    :class="{
      'is-active': item.isActive && !item.isScrolledOver,
      'is-scrolled-over': item.isScrolledOver,
    }"
    :style="{ '--level': item.level }"
  >
    <a :href="'#' + item.id" @click.prevent="onItemClick" :data-item-index="item.itemIndex">
      {{ item.textContent }}
    </a>
  </div>
</template>

<script>
import { defineComponent } from 'vue'

export default defineComponent({
  props: {
    item: {
      type: Object,
      required: true,
    },
    index: {
      type: Number,
      required: true,
    },
  },

  emits: ['item-click'],

  methods: {
    onItemClick(event) {
      this.$emit('item-click', event, this.item.id)
    },
  },
})
</script>
