import collect from 'collect.js'

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
      files: [],
      syntax: {
        vue: 'html',
      },
    }
  },

  computed: {
    props() {
      return {
        name: this.name,
        mode: this.mode,
        inline: this.inline,
        highlight: this.highlight,
        showSource: this.showSource,
      }
    },

    mainFile() {
      const file = this.files
        .find(item => item.path.endsWith('index.vue') || item.path.endsWith('index.jsx'))

      if (!file) {
        return false
      }

      return require(`~/demos/${file.path}`).default
    },
  },

  mounted() {
    this.files = collect(require.context('~/demos/', true, /.+\..+$/).keys())
      .filter(path => path.startsWith(`./${this.name}/`))
      .filter(path => !path.endsWith('.spec.js') && !path.endsWith('.spec.ts'))
      .map(path => path.replace('./', ''))
      .map(path => {
        const extension = path.split('.').pop()

        return {
          path,
          name: path.replace(`${this.name}/`, ''),
          content: require(`!!raw-loader!~/demos/${path}`).default,
          extension,
          highlight: this.syntax[extension] || extension,
        }
      })
      .filter(item => {
        return ['vue', 'ts', 'js', 'jsx', 'scss'].includes(item.extension)
      })
      .sortBy(item => item.path.split('/').length && !item.path.endsWith('index.vue'))
      .toArray()
  },
}
