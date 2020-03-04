<template>
  <div>
    <p>
      Rendered Preview:
    </p>
    <component :is="component" v-if="component" />
    <p>
      Code:
    </p>
    <pre v-if="content" class="language-markup"><code class="language-markup" v-html="$options.filters.highlight(content, 'markup')"></code></pre>
  </div>
</template>

<script>
export default {
  props: {
    path: {
      type: String,
      required: true,
    },
  },

  data() {
    return {
      component: null,
      content: null,
    }
  },

  mounted() {
    const files = require.context(`~/demos/`, true)
      .keys()
      .filter(path => path.startsWith(`./${this.path}`))
      .filter(path => path.endsWith('.vue') || path.endsWith('.js') || path.endsWith('.css'))
      .map(path => path.replace('./', ''))
      .map(path => ({
        path: path.replace(`${this.path}/`, ''),
        content: require(`!!raw-loader!~/demos/${path}`).default
      }))

    console.log(files)

    // this.content = require(`!!raw-loader!~/components/${this.path}`).default
    // this.component = require(`~/components/${this.path}`).default
  }
}
</script>
