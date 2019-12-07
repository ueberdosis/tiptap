module.exports = {
  siteName: 'TipTap',
  port: 3000,
  plugins: [
    {
      use: '@gridsome/vue-remark',
      options: {
        typeName: 'Post',
        baseDir: './content/posts',
        route: '/posts/:slug',
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
      }
    },
    // {
    //   use: '@gridsome/source-filesystem',
    //   options: {
    //     path: './people/**/*.json',
    //     typeName: 'People',
    //   }
    // },
  ]
}
