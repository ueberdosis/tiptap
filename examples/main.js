import Vue from 'vue'
import VueRouter from 'vue-router'
import svgSpriteLoader from 'helpers/svg-sprite-loader'
import App from 'Components/App'

const __svg__ = { path: './assets/images/icons/*.svg', name: 'assets/images/[hash].sprite.svg' }
svgSpriteLoader(__svg__.filename)

Vue.config.productionTip = false

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    component: () => import('Components/Routes/Basic'),
    meta: {
      githubUrl: 'https://github.com/scrumpy/tiptap/tree/master/examples/Components/Routes/Basic',
    },
  },
  {
    path: '/menu-bubble',
    component: () => import('Components/Routes/MenuBubble'),
    meta: {
      githubUrl: 'https://github.com/scrumpy/tiptap/tree/master/examples/Components/Routes/MenuBubble',
    },
  },
  {
    path: '/floating-menu',
    component: () => import('Components/Routes/FloatingMenu'),
    meta: {
      githubUrl: 'https://github.com/scrumpy/tiptap/tree/master/examples/Components/Routes/FloatingMenu',
    },
  },
  {
    path: '/links',
    component: () => import('Components/Routes/Links'),
    meta: {
      githubUrl: 'https://github.com/scrumpy/tiptap/tree/master/examples/Components/Routes/Links',
    },
  },
  {
    path: '/images',
    component: () => import('Components/Routes/Images'),
    meta: {
      githubUrl: 'https://github.com/scrumpy/tiptap/tree/master/examples/Components/Routes/Images',
    },
  },
  {
    path: '/hiding-menu-bar',
    component: () => import('Components/Routes/HidingMenuBar'),
    meta: {
      githubUrl: 'https://github.com/scrumpy/tiptap/tree/master/examples/Components/Routes/HidingMenuBar',
    },
  },
  {
    path: '/tables',
    component: () => import('Components/Routes/Tables'),
    meta: {
      githubUrl: 'https://github.com/scrumpy/tiptap/tree/master/examples/Components/Routes/Tables',
    },
  },
  {
    path: '/todo-list',
    component: () => import('Components/Routes/TodoList'),
    meta: {
      githubUrl: 'https://github.com/scrumpy/tiptap/tree/master/examples/Components/Routes/TodoList',
    },
  },
  {
    path: '/search-and-replace',
    component: () => import('Components/Routes/SearchAndReplace'),
    meta: {
      githubUrl: 'https://github.com/scrumpy/tiptap/tree/master/examples/Components/Routes/SearchAndReplace',
    },
  },
  {
    path: '/suggestions',
    component: () => import('Components/Routes/Suggestions'),
    meta: {
      githubUrl: 'https://github.com/scrumpy/tiptap/tree/master/examples/Components/Routes/Suggestions',
    },
  },
  {
    path: '/markdown-shortcuts',
    component: () => import('Components/Routes/MarkdownShortcuts'),
    meta: {
      githubUrl: 'https://github.com/scrumpy/tiptap/tree/master/examples/Components/Routes/MarkdownShortcuts',
    },
  },
  {
    path: '/code-highlighting',
    component: () => import('Components/Routes/CodeHighlighting'),
    meta: {
      githubUrl: 'https://github.com/scrumpy/tiptap/tree/master/examples/Components/Routes/CodeHighlighting',
    },
  },
  {
    path: '/history',
    component: () => import('Components/Routes/History'),
    meta: {
      githubUrl: 'https://github.com/scrumpy/tiptap/tree/master/examples/Components/Routes/History',
    },
  },
  {
    path: '/read-only',
    component: () => import('Components/Routes/ReadOnly'),
    meta: {
      githubUrl: 'https://github.com/scrumpy/tiptap/tree/master/examples/Components/Routes/ReadOnly',
    },
  },
  {
    path: '/embeds',
    component: () => import('Components/Routes/Embeds'),
    meta: {
      githubUrl: 'https://github.com/scrumpy/tiptap/tree/master/examples/Components/Routes/Embeds',
    },
  },
  {
    path: '/placeholder',
    component: () => import('Components/Routes/Placeholder'),
    meta: {
      githubUrl: 'https://github.com/scrumpy/tiptap/tree/master/examples/Components/Routes/Placeholder',
    },
  },
  {
    path: '/focus',
    component: () => import('Components/Routes/Focus'),
    meta: {
      githubUrl: 'https://github.com/scrumpy/tiptap/tree/master/examples/Components/Routes/Focus',
    },
  },
  {
    path: '/collaboration',
    component: () => import('Components/Routes/Collaboration'),
    meta: {
      githubUrl: 'https://github.com/scrumpy/tiptap/tree/master/examples/Components/Routes/Collaboration',
    },
  },
  {
    path: '/title',
    component: () => import('Components/Routes/Title'),
    meta: {
      githubUrl: 'https://github.com/scrumpy/tiptap/tree/master/examples/Components/Routes/Title',
    },
  },
  {
    path: '/trailing-paragraph',
    component: () => import('Components/Routes/TrailingParagraph'),
    meta: {
      githubUrl: 'https://github.com/scrumpy/tiptap/tree/master/examples/Components/Routes/TrailingParagraph',
    },
  },
  {
    path: '/drag-handle',
    component: () => import('Components/Routes/DragHandle'),
    meta: {
      githubUrl: 'https://github.com/scrumpy/tiptap/tree/master/examples/Components/Routes/DragHandle',
    },
  },
  {
    path: '/export',
    component: () => import('Components/Routes/Export'),
    meta: {
      githubUrl: 'https://github.com/scrumpy/tiptap/tree/master/examples/Components/Routes/Export',
    },
  },
]

const router = new VueRouter({
  routes,
  mode: 'history',
  linkActiveClass: 'is-active',
  linkExactActiveClass: 'is-exact-active',
})

new Vue({
  router,
  render: h => h(App),
}).$mount('#app')
