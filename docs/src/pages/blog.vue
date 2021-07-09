<template>
  <Layout :show-sidebar="false">
    <app-section>
      <div class="text">
        <PostPreview
          v-for="edge in $page.posts.edges"
          :key="edge.node.id"
          :title="edge.node.title"
          :published-at="edge.node.published_at"
          :teaser="edge.node.teaser"
          :link="edge.node.path"
          :author="edge.node.author"
        />
      </div>
    </app-section>
  </Layout>
</template>

<page-query>
query {
  posts: allPost(sortBy: "published_at", order: DESC) {
    edges {
      node {
        id
        title
        teaser
        published_at
        author
        path
      }
    }
  }
}
</page-query>

<script>
import AppSection from '@/components/AppSection'
import PostPreview from '@/components/PostPreview'

export default {

  metaInfo() {
    return {
      title: 'Blog',
      meta: [
        {
          property: 'og:title',
          content: 'tiptap',
        },
        {
          name: 'description',
          content: 'The headless editor framework for web artisans.',
        },
        {
          property: 'og:description',
          content: 'The headless editor framework for web artisans.',
        },
      ],
    }
  },

  components: {
    AppSection,
    PostPreview,
  },

}
</script>
