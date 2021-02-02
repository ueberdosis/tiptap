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
  column-count: 2;
  column-gap: 1rem;
}
</style>
