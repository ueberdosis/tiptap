import Prism from 'prismjs'
import 'prismjs/components/prism-jsx.js'
import 'prismjs/components/prism-typescript.js'
import 'prismjs/components/prism-scss.js'
import PortalVue from 'portal-vue'
import App from '~/layouts/App'

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
  Vue.component('Layout', App)
  Vue.component('Demo', () => import(/* webpackChunkName: "demo" */ '~/components/Demo'))
  Vue.component('LiveDemo', () => import(/* webpackChunkName: "live-demo" */ '~/components/LiveDemo'))
}
