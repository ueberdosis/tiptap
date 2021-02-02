<template>
  <div class="demo-frame">
    <div v-show="isLoading" class="demo-frame__loader">
      …
    </div>
    <iframe
      v-show="!isLoading"
      v-resize.quiet
      :src="`/demos/${name}?${query}`"
      style="background-color: transparent;"
      width="100%"
      height="0"
      frameborder="0"
      @load="onLoad"
    />
  </div>
</template>

<script>
export default {
  props: {
    name: {
      type: String,
      required: true,
    },

    mode: {
      type: String,
      default: 'vue',
    },

    inline: {
      type: Boolean,
      default: false,
    },

    highlight: {
      type: String,
      default: null,
    },

    showSource: {
      type: Boolean,
      default: true,
    },
  },

  data() {
    return {
      isLoading: true,
    }
  },

  computed: {
    query() {
      return `mode=${this.mode}&inline=${this.inline}&highlight=${this.highlight}&showSource=${this.showSource}`
    },
  },

  methods: {
    onLoad() {
      this.isLoading = false
    },
  },
}
</script>

<style lang="scss" scoped>
.demo-frame {
  display: flex;
  flex-direction: column;
  border-radius: 0.5rem;
  overflow: hidden;
  background-color: rgba($colorBlack, 0.05);

  &__loader {
    padding: 1rem;
    text-align: center;
  }
}
</style>
