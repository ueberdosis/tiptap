import 'iframe-resizer/js/iframeResizer.contentWindow'
import './style.scss'

import { createApp } from 'vue'

import { debug, splitName } from './helper.js'

export default function init(name: string, source: any) {
  // @ts-ignore
  window.source = source
  document.title = name

  const [demoCategory, demoName, frameworkName] = splitName(name)

  import(`../src/${demoCategory}/${demoName}/${frameworkName}/index.vue`)
    .then(module => {
      const app = createApp(module.default)

      if (typeof module.configureApp === 'function') {
        module.configureApp(app)
      }
      app.mount('#app')
      debug()
    })
}
