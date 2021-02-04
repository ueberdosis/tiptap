<template>
  <div class="feature-item text">
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
.feature-item {
  break-inside: avoid-column;
  background-color: rgba($colorBlack, 0.03);
  border-radius: 0.75rem;
  padding: 1.5rem;
  margin-bottom: 1rem;
}
</style>
