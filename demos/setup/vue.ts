import 'iframe-resizer/js/iframeResizer.contentWindow'
import './style.scss'

import { createApp } from 'vue'

import { debug } from './helper'

export default function init(name: string, source: any) {
  // @ts-ignore
  window.source = source
  document.title = name

  import(`../src/${name}/index.vue`)
    .then(module => {
      createApp(module.default).mount('#app')
      debug()
    })
}
