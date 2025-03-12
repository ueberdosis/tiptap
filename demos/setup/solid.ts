import 'iframe-resizer/js/iframeResizer.contentWindow'
import './style.scss'

import { render } from 'solid-js/web'

import { debug, splitName } from './helper.js'

export default function init(name: string, source: any) {
  // @ts-ignore
  window.source = source
  document.title = name

  const [demoCategory, demoName, frameworkName] = splitName(name)

  import(`../src/${demoCategory}/${demoName}/${frameworkName}/index.tsx`)
    .then(module => {
      const root = document.getElementById('app')

      if (root) {
        render(module.default, root)
      }
      debug()
    })
    .catch(() => {
      import(`../src/${demoCategory}/${demoName}/${frameworkName}/index.jsx`).then(module => {
        const root = document.getElementById('app')

        if (root) {
          render(module.default, root)
        }
        debug()
      })
    })
}
