<template>
  <div class="feature-list">
    <slot />
  </div>
</template>

<script>
export default {
  props: {
  },
}
</script>

<style lang="scss" scoped>
.feature-list {

  @media (min-width: 700px) {
    column-count: 2;
    column-gap: 1rem;
  }
}
</style>
