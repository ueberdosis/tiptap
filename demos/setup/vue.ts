import 'iframe-resizer/js/iframeResizer.contentWindow'
import './style.scss'

import { createApp } from 'vue'

import { debug, splitName } from './helper'

export default function init(name: string, source: any) {
  // @ts-ignore
  window.source = source
  document.title = name

  const [demoCategory, demoName] = splitName(name)

  import(`../src/${demoCategory}/${demoName}/Vue/index.vue`)
    .then(module => {
      createApp(module.default).mount('#app')
      debug()
    })
}
