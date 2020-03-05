// This is the main.js file. Import global CSS and scripts here.
// The Client API can be used here. Learn more: gridsome.org/docs/client-api

import Prism from 'prismjs'
import 'prismjs/themes/prism-okaidia.css'

import DefaultLayout from '~/layouts/Default.vue'
import Demo from '~/components/Demo.vue'

export default function (Vue, { router, head, isClient }) {
  Vue.component('Layout', DefaultLayout)
  Vue.component('Demo', Demo)
  Vue.filter('highlight', (code, lang = 'javascript') => {
    return Prism.highlight(code, Prism.languages[lang], lang)
  })
}
