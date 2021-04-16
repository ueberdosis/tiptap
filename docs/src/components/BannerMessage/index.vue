<template>
  <g-link :class="`banner-message banner-message--${color}`" :to="to">
    <slot />
  </g-link>
</template>

<script>
export default {
  props: {
    to: {
      type: String,
      required: true,
    },

    color: {
      type: String,
      default: 'black',
    },
  },
}
</script>

<style lang="scss" scoped>
.banner-message {
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
  padding: 0.65rem 1rem;
  font-size: 0.85rem;
  font-weight: 500;

  &--black {
    background-color: $colorBlack;
    color: $colorWhite;
  }

  &--yellow {
    background-color: $colorYellow;
    color: $colorBlack;
  }
}
</style>
