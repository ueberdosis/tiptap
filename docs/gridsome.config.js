const path = require('path')

function addStyleResource(rule) {
  rule.use('style-resource')
    .loader('style-resources-loader')
    .options({
      patterns: [
        path.resolve(__dirname, './src/variables.scss'),
      ],
    })
}

module.exports = {
  siteName: 'tiptap 2',
  titleTemplate: '%s',
  port: 3000,
  plugins: [
    {
      use: '@gridsome/vue-remark',
      options: {
        typeName: 'DocPage',
        baseDir: './src/docPages',
        template: './src/templates/DocPage',
        index: './introduction',
        plugins: [
          '@gridsome/remark-prismjs',
          'remark-container',
          'remark-toc',
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
      use: 'gridsome-plugin-simple-analytics',
      options: {
        domain: 'data.tiptap.dev',
      },
    },
  ],
  runtimeCompiler: true,
  configureWebpack: {
    node: {
      fs: 'empty',
      child_process: 'empty',
      tls: 'empty',
      net: 'empty',
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
