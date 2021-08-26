import Prism from 'prismjs'
import 'prismjs/components/prism-jsx.js'
import 'prismjs/components/prism-typescript.js'
import 'prismjs/components/prism-scss.js'
import PortalVue from 'portal-vue'
import iframeResize from 'iframe-resizer/js/iframeResizer'
import App from '~/layouts/App'
import './TiptapDemo'

Prism.manual = true

export default function (Vue, { router, head }) {
  // fix docsearch
  if (typeof window === 'object' && !window.process) {
    window.process = {
      env: {
        NODE_ENV: 'production',
      },
    }
  }

  head.link.push({
    rel: 'alternate',
    type: 'application/rss+xml',
    title: 'tiptap blog',
    href: 'https://www.tiptap.dev/feed.xml',
  })

  head.link.push({
    rel: 'alternate',
    type: 'application/json',
    title: 'tiptap blog',
    href: 'https://www.tiptap.dev/feed.json',
  })

  router.beforeEach((to, _from, next) => {
    head.meta.push({
      key: 'og:url',
      name: 'og:url',
      content: `https://www.tiptap.dev/${to.path}`,
    })
    next()
  })

  Vue.use(PortalVue)

  Vue.directive('resize', {
    bind: (el, { value = {} }) => {
      el.addEventListener('load', () => {
        iframeResize({
          ...value,
          messageCallback(messageData) {
            if (messageData.message.type !== 'resize') {
              return
            }

            const style = window.getComputedStyle(el.parentElement)
            const maxHeight = parseInt(style.getPropertyValue('max-height'), 10)

            if (messageData.message.height > maxHeight) {
              el.setAttribute('scrolling', 'auto')
            } else {
              el.setAttribute('scrolling', 'no')
            }

            el?.iFrameResizer?.resize?.()
          },
        }, el)
      })
    },
    unbind(el) {
      el?.iFrameResizer?.removeListeners?.()
    },
  })

  Vue.component('Layout', App)
  Vue.component('ContentMissing', () => import(/* webpackChunkName: "contentMissing" */ '~/components/ContentMissing'))
}
