<template>
  <div class="page" spellcheck="false">

    <banner />

    <navigation />

    <hero />

    <subnavigation />

    <div class="page__content">
      <router-view />
    </div>

    <div class="page__footer">
      <a class="page__source-link" :href="$route.meta.githubUrl" target="_blank">
        <icon name="code" />
        <span>
          Show Code
        </span>
      </a>
    </div>

  </div>
</template>

<script>
import Banner from 'Components/Banner'
import Navigation from 'Components/Navigation'
import Hero from 'Components/Hero'
import Subnavigation from 'Components/Subnavigation'
import Icon from 'Components/Icon'

export default {
  components: {
    Banner,
    Navigation,
    Hero,
    Subnavigation,
    Icon,
  },
}
</script>

<style lang="scss" src="./style.scss"></style>
