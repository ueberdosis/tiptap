import Prism from 'prismjs'
import 'prismjs/themes/prism-okaidia.css'
import DefaultLayout from '~/layouts/Default.vue'
import Demo from '~/components/Demo'

export default function (Vue, { router, head, isClient }) {
  Vue.component('Layout', DefaultLayout)
  Vue.component('Demo', Demo)
  Vue.filter('highlight', (code, lang = 'javascript') => {
    return Prism.highlight(code, Prism.languages[lang], lang)
  })
}
