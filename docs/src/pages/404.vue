<template>
  <div class="error-page">
    Oh no, page not found.
    <g-link
      to="/"
    >
      → Back
    </g-link>
  </div>
</template>

<style lang="scss">
.error-page {
  margin: 5rem 1rem;
  text-align: center;
  color: rgba($colorWhite, 0.4);

  a {
    color: $colorWhite;
  }
}
</style>
