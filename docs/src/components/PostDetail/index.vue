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
