<template>
  <g-link class="logo-item" :to="to">
    <div class="logo-item__image" v-html="svg" v-if="svg" />
    <div class="logo-item__title">
      {{ title }}
    </div>
  </g-link>
</template>

<script>
export default {
  props: {
    title: {
      type: String,
      default: null,
    },

    image: {
      type: String,
      default: null,
    },

    to: {
      type: String,
      default: null,
    },
  },

  data() {
    return {
      svg: null,
    }
  },

  created() {
    this.svg = require(`!html-loader!@/assets/logos/${this.image}.svg`)
  },
}
</script>

<style lang="scss" scoped>
.logo-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: rgba($colorBlack, 0.03);
  border-radius: 0.75rem;
  padding: 1.5rem;
  margin-bottom: 1rem;

  &__image ::v-deep svg {
    width: 100%;
    height: 3rem;
  }

  &__title {
    white-space: nowrap;
    font-size: 0.85rem;
  }
}
</style>
