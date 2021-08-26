<template>
  <div class="flex flex-col relative min-h-[5rem]">
    <div class="absolute top-0 left-0 w-full h-full flex justify-center items-center pointer-events-none" v-if="isLoading">
      <svg
        class="animate-spin -ml-1 mr-3 h-5 w-5"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          class="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          stroke-width="4"
        />
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
      </svg>
    </div>
    <iframe
      class="bg-transparent max-h-[28rem]"
      v-resize.quiet="{ scrolling: 'omit' }"
      :src="src"
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
    src: {
      required: true,
      type: String,
    },
  },

  data() {
    return {
      isLoading: true,
    }
  },

  methods: {
    onLoad() {
      this.isLoading = false
    },
  },
}
</script>

<style>

</style>
