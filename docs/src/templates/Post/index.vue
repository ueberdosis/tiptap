<template>
  <Layout :show-sidebar="false">
    <app-section>
      <PostDetail
        :title="$page.post.title"
        :content="$page.post.content"
        :published-at="$page.post.published_at"
        :author="$page.post.author"
      />
    </app-section>
  </Layout>
</template>

<page-query>
query($path: String!) {
  post: post(path: $path) {
    id
    title
    teaser
    slug
    content
    published_at
    author
    fileInfo {
      path
    }
  }
}
</page-query>

<script>
import PostDetail from '@/components/PostDetail'
import AppSection from '@/components/AppSection'

export default {

  metaInfo() {
    return {
      title: this.$page.post.title,
      script: [{
        type: 'application/ld+json',
        json: {
          '@context': 'https://schema.org',
          '@type': 'NewsArticle',
          mainEntityOfPage: {
            '@type': 'WebPage',
            '@id': 'https://www.tiptap.dev',
          },
          headline: this.$page.post.title,
          image: [
            this.getOpenGraphImage(),
          ],
          datePublished: this.$page.post.published_at,
          dateModified: this.$page.post.published_at,
          author: {
            '@type': 'Person',
            name: this.$page.post.author,
          },
          publisher: {
            '@type': 'Organization',
            name: 'tiptap',
            logo: {
              '@type': 'ImageObject',
              url: 'https://www.tiptap.dev/assets/img/logo.svg',
            },
          },
        },
      }],
      meta: [
        // General
        {
          name: 'description',
          content: this.$page.post.teaser,
        },

        // OpenGraph
        {
          property: 'og:title',
          content: this.$page.post.title,
        },
        {
          property: 'og:description',
          content: this.$page.post.teaser,
        },
        {
          property: 'og:image',
          content: this.getOpenGraphImage(),
        },

        // Twitter
        {
          name: 'twitter:title',
          content: this.$page.post.title,
        },
        {
          name: 'twitter:description',
          content: this.$page.post.teaser,
        },
        {
          name: 'twitter:card',
          content: 'summary_large_image',
        },
        {
          name: 'twitter:image',
          content: this.getOpenGraphImage(),
        },
        {
          name: 'twitter:site',
          content: '@tiptap_editor',
        },
      ],
    }
  },

  components: {
    PostDetail,
    AppSection,
  },

  methods: {
    getOpenGraphImage() {
      const path = this.$route.path.replace(/\/$/, '')

      return path === ''
        ? 'https://www.tiptap.dev/og-image.png'
        : `/images${path}/og-image.png`
    },
  },

}
</script>
