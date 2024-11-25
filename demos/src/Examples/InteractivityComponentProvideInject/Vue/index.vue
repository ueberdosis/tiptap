<template>
  <Editor />
</template>

<script>
import Editor from './Editor.vue'

export default {
  components: {
    Editor,
  },

  provide() {
    return {
      indexValue: 'indexValue',
    }
  },
}

export function configureApp(app) {
  app.config.globalProperties.globalValue = 'globalValue'
  app.provide('appValue', 'appValue')
}
</script>
