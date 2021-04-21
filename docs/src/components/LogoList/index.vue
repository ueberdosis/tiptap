<template>
  <div class="logo-list">
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
.logo-list {
  column-count: 2;
  column-gap: 1rem;

  @media (min-width: 700px) {
    column-count: 4;
  }
}
</style>
