import 'iframe-resizer/js/iframeResizer.contentWindow'
import './style.scss'

import { debug, splitName } from './helper'

export default function init(name: string, source: any) {
  // @ts-ignore
  window.source = source
  document.title = name

  const [demoCategory, demoName] = splitName(name)

  import(`../src/${demoCategory}/${demoName}/Svelte/index.svelte`)
    .then(Module => {
      const Component = Module.default

      new Component({ target: document.querySelector('#app') }) // eslint-disable-line

      debug()
    })
}
