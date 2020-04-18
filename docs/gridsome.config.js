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
  siteName: 'tiptap',
  port: 3000,
  plugins: [
    {
      use: '@gridsome/vue-remark',
      options: {
        typeName: 'Post',
        baseDir: './src/data/posts',
        route: '/:slug',
        template: './src/templates/Post.vue',
        plugins: [
          '@gridsome/remark-prismjs',
          [
            '@noxify/gridsome-plugin-remark-embed',
            {
              'enabledProviders' : ['Youtube', 'Twitter', 'Gist'],
            },
          ],
        ],
      },
    },
  ],
  chainWebpack(config) {
    // Load variables for all vue-files
    const types = ['vue-modules', 'vue', 'normal-modules', 'normal']

    types.forEach(type => {
      addStyleResource(config.module.rule('scss').oneOf(type))
    })
  },
}
