<template>
  <div class="feature-item">
    <div class="feature-item__inner">
      <svg class="feature-item__icon" v-if="icon">
        <use :xlink:href="require('remixicon/fonts/remixicon.symbol.svg') + `#ri-${icon}`" />
      </svg>
      <div class="feature-item__content text">
        <slot />
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    icon: {
      type: String,
      default: null,
    },
  },
}
</script>

<style lang="scss" scoped>
.feature-item {
  -webkit-column-break-inside: avoid;
  break-inside: avoid-column;
  page-break-inside: avoid;
  padding-bottom: 1rem;

  &__inner {
    background-color: rgba($colorBlack, 0.03);
    border-radius: 0.75rem;
    padding: 1.5rem;
    transition: box-shadow 0.2s ease;

    &:hover {
      box-shadow: 0 0 0 0.25rem rgba($colorBlack, 0.03);
    }
  }

  &__icon {
    width: 3rem;
    height: 3rem;
    margin-bottom: 1rem;
    background-color: rgba($colorBlack, 0.05);
    padding: 0.5rem;
    border-radius: 50%;
  }
}
</style>
