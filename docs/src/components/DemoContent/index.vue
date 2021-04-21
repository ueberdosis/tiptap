<template>
  <component :is="mainFile" v-if="mainFile && mode === 'vue'" />
  <react-renderer :component="mainFile" v-else-if="mainFile && mode === 'react'" />
</template>

<script>
import DemoMixin from '~/components/DemoMixin'

export default {
  mixins: [DemoMixin],

  components: {
    ReactRenderer: () => import(/* webpackChunkName: "react-renderer" */ '~/components/ReactRenderer'),
  },
}
</script>
