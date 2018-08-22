<template>
  <div class="page" spellcheck="false">
    <navigation />
    <div class="page__content">
      <router-view />
    </div>
  </div>
</template>

<script>
import Navigation from 'Components/Navigation'

export default {
  components: {
    Navigation,
  },
}
</script>

<style lang="scss" src="./style.scss"></style>
