// eslint-disable-next-line
import Prism from 'prismjs'
import 'prismjs/components/prism-jsx.js'
import 'prismjs/components/prism-scss.js'
import App from '~/layouts/App'

export default function (Vue) {
  Vue.component('Layout', App)
  Vue.component('Demo', () => import('~/components/Demo'))
  Vue.component('LiveDemo', () => import('~/components/LiveDemo'))
}
