import collect from 'collect.js'

export default {
  props: {
    name: {
      type: String,
      required: true,
    },

    inline: {
      type: Boolean,
      default: false,
    },

    highlight: {
      type: String,
      default: null,
    },

    hideSource: {
      type: Boolean,
      default: false,
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
        inline: this.inline,
        highlight: this.highlight,
        hideSource: this.hideSource,
      }
    },

    mainFile() {
      if (!this.mainFilePath) {
        return false
      }

      return require(`~/demos/${this.mainFilePath}`).default
    },

    mainFilePath() {
      const file = this.files.find(item => item.path.endsWith('index.vue') || item.path.endsWith('index.jsx'))

      if (file) {
        return file.path
      }
    },

    mode() {
      if (this.mainFilePath?.endsWith('.jsx')) {
        return 'react'
      }

      return 'vue'
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
      .sortBy(item => item.path.split('/').length && !item.path.endsWith('index.vue') && !item.path.endsWith('index.jsx'))
      .toArray()
  },
}
