import React from 'react'
import { createRoot } from 'react-dom/client'
import 'iframe-resizer/js/iframeResizer.contentWindow'
import { debug, splitName } from './helper'
import './style.scss'

export default function init(name: string, source: any) {
  // @ts-ignore
  window.source = source
  document.title = name

  const [demoCategory, demoName] = splitName(name)

  import(`../src/${demoCategory}/${demoName}/React/index.jsx`)
    .then(module => {
      const root = document.getElementById('app')

      if (root) {
        createRoot(root).render(React.createElement(module.default))
      }
      debug()
    })
}
