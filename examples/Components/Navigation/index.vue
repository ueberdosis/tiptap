<template>
  <div class="navigation">

    <div>
      <h1 class="navigation__logo">
        tiptap
      </h1>
      <github-button
        class="navigation__count"
        href="https://github.com/ueberdosis/tiptap"
        data-show-count="true"
        aria-label="Star ueberdosis/tiptap on GitHub"
      />
    </div>

    <div>
      <a class="navigation__link" href="https://tiptap.dev/docs" target="_blank">
        Documentation
      </a>
      <a class="navigation__github-link" href="https://github.com/ueberdosis/tiptap" target="_blank">
        <icon class="navigation__icon" name="github" />
      </a>
    </div>

  </div>
</template>

<script>
import Icon from 'Components/Icon'
import GithubButton from 'vue-github-button'

export default {
  components: {
    Icon,
    GithubButton,
  },
}
</script>

<style lang="scss" src="./style.scss" scoped></style>
