<template>
  <article class="c-post-detail">
    <header class="c-post-detail__header text">
      <h1 class="c-post-detail__title">
        {{ title }}
      </h1>
      <p class="c-post-detail__meta">
        Published
        <time :datetime="publishedAt">
          {{ formattedPublishedAt }}
        </time>
      </p>
    </header>

    <VueRemarkContent class="text" />

    <div class="c-post-detail__footer">
      <div class="text">
        <div class="remark-container warning">
          <p class="remark-container-title">Become a tiptap insider!</p>
          <p>Like what you’re reading? <g-link to="https://github.com/sponsors/ueberdosis">Sponsor our work</g-link> to get early access to new features.</p>
        </div>
      </div>
    </div>
  </article>
</template>

<script>
import moment from 'moment'

export default {
  props: {
    title: {
      default: null,
      type: String,
    },
    author: {
      default: null,
      type: String,
    },
    content: {
      default: null,
      type: String,
    },
    publishedAt: {
      default: null,
      type: String,
    },
  },

  computed: {
    formattedPublishedAt() {
      return moment(this.publishedAt).format('MMM Do, YYYY')
    },
  },
}
</script>

<style lang="scss" src="./style.scss"></style>
