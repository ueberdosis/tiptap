const path = require('path')
const visit = require('unist-util-visit')

function addStyleResource(rule) {
  rule.use('style-resource')
    .loader('style-resources-loader')
    .options({
      patterns: [
        path.resolve(__dirname, './src/variables.scss'),
      ],
    })
}

function tableWrapper() {
  return async tree => {
    visit(
      tree,
      'table',
      (node, index, parent) => {
        if (node.type === 'table' && parent.type === 'root') {
          const original = { ...node }

          node.type = 'div'
          node.children = [original]
          node.data = {
            hProperties: {
              class: 'table-wrapper',
            },
          }
        }
      },
    )
  }
}

module.exports = {
  siteName: 'tiptap',
  titleTemplate: '%s – tiptap editor',
  icon: './src/favicon.svg',
  port: 3000,
  plugins: [
    {
      use: '@gridsome/vue-remark',
      options: {
        typeName: 'DocPage',
        baseDir: './src/docPages',
        template: './src/templates/DocPage/index.vue',
        plugins: [
          '@gridsome/remark-prismjs',
          'remark-container',
          'remark-toc',
          tableWrapper,
        ],
        remark: {
          autolinkHeadings: {
            content: {
              type: 'text',
              value: '#',
            },
          },
        },
      },
    },
    {
      use: '@gridsome/vue-remark',
      options: {
        typeName: 'Post',
        baseDir: './src/posts',
        template: './src/templates/Post/index.vue',
        route: '/blog/:slug',
        plugins: [
          '@gridsome/remark-prismjs',
          'remark-container',
          'remark-toc',
          tableWrapper,
        ],
        remark: {
          autolinkHeadings: {
            content: {
              type: 'text',
              value: '#',
            },
          },
        },
      },
    },
  ],
  transformers: {
    remark: {
      // global remark options
    },
  },
  runtimeCompiler: true,
  configureWebpack: {
    node: {
      fs: 'empty',
      child_process: 'empty',
      tls: 'empty',
      net: 'empty',
    },
    externals: {
      canvas: 'commonjs canvas',
    },
  },
  chainWebpack(config) {
    // Load variables for all vue-files
    const types = ['vue-modules', 'vue', 'normal-modules', 'normal']

    types.forEach(type => {
      addStyleResource(config.module.rule('scss').oneOf(type))
    })
  },
}
