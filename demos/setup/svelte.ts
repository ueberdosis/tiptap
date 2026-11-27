import 'iframe-resizer/js/iframeResizer.contentWindow'
import './style.scss'

import { mount } from 'svelte'
import { applyTheme, debug, splitName } from './helper.js'

export default function init(name: string, source: any) {
  // @ts-ignore
  window.source = source
  document.title = name
  applyTheme(document, new URLSearchParams(window.location.search).get('theme'))

  const [demoCategory, demoName, frameworkName] = splitName(name)

  import(`../src/${demoCategory}/${demoName}/${frameworkName}/index.svelte`).then(Module => {
    const Component = Module.default

    mount(Component, { target: document.querySelector('#app')! })

    debug()
  })
}
