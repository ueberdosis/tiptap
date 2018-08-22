<template>
  <div class="page" spellcheck="false">
    <navigation />
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
import Navigation from 'Components/Navigation'
import Icon from 'Components/Icon'

export default {
  components: {
    Navigation,
    Icon,
  },
}
</script>

<style lang="scss" src="./style.scss"></style>
