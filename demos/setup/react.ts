import React from 'react'
import ReactDOM from 'react-dom'
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
      // @ts-ignore waiting for https://github.com/DefinitelyTyped/DefinitelyTyped/pull/56210
      ReactDOM.createRoot(document.getElementById('app')).render(React.createElement(module.default))
      debug()
    })
}
