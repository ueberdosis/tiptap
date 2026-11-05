import 'iframe-resizer/js/iframeResizer.contentWindow'
import './style.scss'

import React from 'react'
import { createRoot } from 'react-dom/client'

import { applyTheme, debug, splitName } from './helper.js'

export default function init(name: string, source: any) {
  // @ts-ignore
  window.source = source
  document.title = name
  applyTheme(document, new URLSearchParams(window.location.search).get('theme'))

  const [demoCategory, demoName, frameworkName] = splitName(name)

  import(`../src/${demoCategory}/${demoName}/${frameworkName}/index.tsx`)
    .then(module => {
      const root = document.getElementById('app')

      if (root) {
        createRoot(root).render(React.createElement(module.default))
      }
      debug()
    })
    .catch(() => {
      import(`../src/${demoCategory}/${demoName}/${frameworkName}/index.jsx`).then(module => {
        const root = document.getElementById('app')

        if (root) {
          createRoot(root).render(React.createElement(module.default))
        }
        debug()
      })
    })
}
