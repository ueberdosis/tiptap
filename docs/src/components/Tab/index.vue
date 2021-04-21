<template>
  <pre v-if="formattedCode"><code>{{ formattedCode }}</code></pre>
</template>

<script>
import { outdent } from '@mvasilkov/outdent'

export default {
  data() {
    return {
      formattedCode: null,
    }
  },

  methods: {
    updateCode() {
      const { text } = this.$slots.default[0]

      if (text) {
        this.formattedCode = outdent(text)
      }
    },
  },

  beforeUpdate() {
    this.updateCode()
  },

  mounted() {
    this.updateCode()
  },
}
</script>
