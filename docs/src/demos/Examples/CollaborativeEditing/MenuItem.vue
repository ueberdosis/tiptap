<template>
  <button
    class="menu-item"
    :class="{ 'is-active': isActive ? isActive(): null }"
    @click="action"
  >
    <svg class="remix">
      <use :xlink:href="require('../../../../../node_modules/remixicon/fonts/remixicon.symbol.svg') + `#ri-${icon}`" />
    </svg>
  </button>
</template>

<script>
export default {
  props: {
    icon: {
      type: String,
      required: true,
    },

    action: {
      type: Function,
      required: true,
    },

    isActive: {
      type: Function,
      default: null,
    },
  },
}
</script>

<style lang="scss" scoped>
.menu-item {
  width: 1.75rem;
  height: 1.75rem;
  color: rgba(black, 0.5);
  border: none;
  background-color: transparent;
  border-radius: 0.25rem;
  padding: 0.25rem;
  margin-right: 0.25rem;

  svg {
    width: 100%;
    height: 100%;
    fill: currentColor;
  }

  &.is-active,
  &:hover {
    color: black;
    background-color: rgba(black, 0.05);
  }
}
</style>
