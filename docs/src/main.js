// eslint-disable-next-line
import Prism from 'prismjs'
import 'prismjs/components/prism-jsx.js'
import 'prismjs/components/prism-scss.js'
import App from '~/layouts/App'
import Demo from '~/components/Demo'
import LiveDemo from '~/components/LiveDemo'
import Tab from '~/components/Tab'
import ReactRenderer from '~/components/ReactRenderer'

export default function (Vue) {
  Vue.component('Layout', App)
  Vue.component('Demo', Demo)
  Vue.component('LiveDemo', LiveDemo)
  Vue.component('Tab', Tab)
  Vue.component('ReactRenderer', ReactRenderer)
}
