<template>
  <div :class="`hint hint--${type}`">
    <slot />
  </div>
</template>

<script>
export default {
  props: {
    type: {
      type: String,
    }
  }
}
</script>

<style lang="scss" src="./style.scss" scoped></style>