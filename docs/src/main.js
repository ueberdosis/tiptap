import Prism from 'prismjs'
import 'prismjs/components/prism-jsx.js'
import 'prismjs/components/prism-scss.js'
import App from '~/layouts/App'
import Demo from '~/components/Demo'
import Tab from '~/components/Tab'
import ReactRenderer from '~/components/ReactRenderer'

import '@tiptap/core/../src/test.ts'

export default function (Vue, { router, head, isClient }) {
  Vue.component('Layout', App)
  Vue.component('Demo', Demo)
  Vue.component('Tab', Tab)
  Vue.component('ReactRenderer', ReactRenderer)
}
