// This is the main.js file. Import global CSS and scripts here.
// The Client API can be used here. Learn more: gridsome.org/docs/client-api

import 'prismjs/themes/prism-okaidia.css'

import DefaultLayout from '~/layouts/Default.vue'

import Prism from 'prismjs'


export default function (Vue, { router, head, isClient }) {

  Vue.filter('highlight', (code, lang = 'javascript') => {
    return Prism.highlight(code, Prism.languages[lang], lang)
  })

  Vue.component('Layout', DefaultLayout)
}
