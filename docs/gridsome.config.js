const path = require('path')
const visit = require('unist-util-visit')
const unified = require('unified')
const markdown = require('remark-parse')
const html = require('remark-html')

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
  siteUrl: 'https://www.tiptap.dev/',
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
    {
      use: 'gridsome-plugin-feed',
      options: {
        // Required: array of `GraphQL` type names you wish to include
        contentTypes: ['Post'],
        // Optional: any properties you wish to set for `Feed()` constructor
        // See https://www.npmjs.com/package/feed#example for available properties
        feedOptions: {
          title: 'tiptap blog',
          description: 'The headless editor framework for web artisans.',
          language: 'en',
          // TODO: Should work, but doesn’t.
          // https://github.com/onecrayon/gridsome-plugin-feed
          // https://www.npmjs.com/package/feed
          favicon: './src/favicon.svg',
        },
        // === All options after this point show their default values ===
        // Optional; opt into which feeds you wish to generate, and set their output path
        rss: {
          enabled: true,
          output: '/feed.xml',
        },
        json: {
          enabled: true,
          output: '/feed.json',
        },
        // Optional: the maximum number of items to include in your feed
        maxItems: 10,
        // Optional: an array of properties passed to `Feed.addItem()` that will be parsed for
        // URLs in HTML (ensures that URLs are full `http` URLs rather than site-relative).
        // To disable this functionality, set to `null`.
        htmlFields: ['description', 'content'],
        // Optional: if you wish to enforce trailing slashes for site URLs
        enforceTrailingSlashes: false,
        // Optional: a method that accepts a node and returns true (include) or false (exclude)
        // Example: only past-dated nodes: `filterNodes: (node) => node.date <= new Date()`
        filterNodes: () => true,
        // Optional: a method that accepts a node and returns an object for `Feed.addItem()`
        // See https://www.npmjs.com/package/feed#example for available properties
        // NOTE: `date` field MUST be a Javascript `Date` object
        nodeToFeedItem: node => {
          const content = unified()
            .use(markdown)
            .use(html)
            .processSync(node.content)
            .toString()

          return {
            title: node.title,
            date: node.published_at,
            description: node.teaser,
            content,
            author: [
              {
                name: node.author,
              },
            ],
          }
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
