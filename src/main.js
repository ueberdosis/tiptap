import Prism from 'prismjs'
import 'prismjs/themes/prism-coy.css'
import DefaultLayout from '~/layouts/Default.vue'
import Demo from '~/components/Demo'
import Tab from '~/components/Tab'

export default function (Vue, { router, head, isClient }) {
  Vue.component('Layout', DefaultLayout)
  Vue.component('Demo', Demo)
  Vue.component('Tab', Tab)
  Vue.filter('highlight', (code, lang = 'javascript') => {
    return Prism.highlight(code, Prism.languages[lang], lang)
  })
}
