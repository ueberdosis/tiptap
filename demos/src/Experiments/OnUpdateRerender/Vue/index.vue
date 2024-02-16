<template>
  <div><button @click="countUp">INC</button> = {{ count }}</div>
  <TiptapComponent :count="count" />
</template>

<script>
import TiptapComponent from './TiptapComponent.vue'

export default {
  components: {
    TiptapComponent,
  },

  data() {
    return {
      count: 0,
    }
  },

  methods: {
    countUp() {
      this.count += 1
    },
  },
}
</script>
