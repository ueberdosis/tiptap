<template>
  <div v-if="mainFile">
    <component :is="mainFile" v-if="mode === 'vue'" />
    <react-renderer :component="mainFile" v-if="mode === 'react'" />
  </div>
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
