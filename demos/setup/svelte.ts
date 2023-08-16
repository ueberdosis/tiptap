import 'iframe-resizer/js/iframeResizer.contentWindow'
import './style.scss'

import { debug, splitName } from './helper.js'

export default function init(name: string, source: any) {
  // @ts-ignore
  window.source = source
  document.title = name

  const [demoCategory, demoName, frameworkName] = splitName(name)

  import(`../src/${demoCategory}/${demoName}/${frameworkName}/index.svelte`)
    .then(Module => {
      const Component = Module.default

      new Component({ target: document.querySelector('#app') }) // eslint-disable-line

      debug()
    })
}
