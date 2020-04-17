import Prism from 'prismjs'
import 'prismjs/themes/prism-coy.css'
import 'prismjs/components/prism-jsx.js'
import App from '~/layouts/App'
import Demo from '~/components/Demo'
import Tab from '~/components/Tab'
import ReactRenderer from '~/components/ReactRenderer'

export default function (Vue, { router, head, isClient }) {
  Vue.component('Layout', App)
  Vue.component('Demo', Demo)
  Vue.component('Tab', Tab)
  Vue.component('ReactRenderer', ReactRenderer)
  Vue.filter('highlight', (code, lang = 'javascript') => {
    return Prism.highlight(code, Prism.languages[lang], lang)
  })
}
