import 'iframe-resizer/js/iframeResizer.contentWindow'
import './style.scss'

import { render } from 'solid-js/web'

import { debug, splitName } from './helper.js'

const demoModules = import.meta.glob('../src/**/Solid/index.tsx')

export default function init(name: string, source: unknown) {
  // @ts-ignore
  window.source = source
  document.title = name

  const [demoCategory, demoName, frameworkName] = splitName(name)
  const modulePath = `../src/${demoCategory}/${demoName}/${frameworkName}/index.tsx`
  const loadModule = demoModules[modulePath]

  if (!loadModule) {
    console.error(`Solid demo not found: ${modulePath}`)
    return
  }

  loadModule().then(module => {
    const root = document.getElementById('app')

    if (root) {
      render(module.default, root)
    }

    debug()
  })
}
