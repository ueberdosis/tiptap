import Prism from 'prismjs'
import 'prismjs/components/prism-jsx.js'
import 'prismjs/components/prism-typescript.js'
import 'prismjs/components/prism-scss.js'
import PortalVue from 'portal-vue'
import iframeResize from 'iframe-resizer/js/iframeResizer'
import App from '~/layouts/App'
import DemoFrame from '~/components/DemoFrame'

Prism.manual = true

export default function (Vue, { head }) {
  head.htmlAttrs = { 'data-theme': 'dark' }

  // fix docsearch
  if (typeof window === 'object' && !window.process) {
    window.process = {
      env: {
        NODE_ENV: 'production',
      },
    }
  }

  Vue.use(PortalVue)

  Vue.directive('resize', {
    bind(el, { value = {} }) {
      el.addEventListener('load', () => iframeResize(value, el))
    },
    unbind(el) {
      el.iFrameResizer.removeListeners()
    },
  })

  Vue.component('Layout', App)
  Vue.component('Demo', () => import(/* webpackChunkName: "demo" */ '~/components/Demo'))
  Vue.component('DemoFrame', DemoFrame)
  Vue.component('LiveDemo', () => import(/* webpackChunkName: "live-demo" */ '~/components/LiveDemo'))
}
