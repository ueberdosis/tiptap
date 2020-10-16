// eslint-disable-next-line
import Prism from 'prismjs'
import 'prismjs/components/prism-jsx.js'
import 'prismjs/components/prism-scss.js'
import PortalVue from 'portal-vue'
import App from '~/layouts/App'

export default function (Vue, { router }) {
  Vue.use(PortalVue)
  Vue.component('Layout', App)
  Vue.component('Demo', () => import(/* webpackChunkName: "demo" */ '~/components/Demo'))
  Vue.component('LiveDemo', () => import(/* webpackChunkName: "live-demo" */ '~/components/LiveDemo'))

  router.options.scrollBehavior = async (to, from, savedPosition) => {
    if (to.hash) {
      const elem = document.querySelector(to.hash)

      if (elem) {
        const offset = parseFloat(getComputedStyle(elem).scrollMarginTop)
        return {
          selector: to.hash,
          offset: { y: offset },
        }
      }
    }

    if (savedPosition) {
      return savedPosition
    }

    return { x: 0, y: 0 }
  }

}
