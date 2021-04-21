<template>
  <div class="error-page">
    <div class="error-page__content">
      Oh no, we can’t find this page.
      <g-link
        to="/"
      >
        → Go back
      </g-link>
    </div>
  </div>
</template>

<style lang="scss">
.error-page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  color: rgba($colorBlack, 0.4);

  a {
    color: $colorBlack;
  }
}
</style>
