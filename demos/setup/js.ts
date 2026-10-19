import 'iframe-resizer/js/iframeResizer.contentWindow'
import './style.scss'

import { applyTheme, debug } from './helper.js'

export default function init(name: string, source: any) {
  // @ts-ignore
  window.source = source
  document.title = name
  applyTheme(document, new URLSearchParams(window.location.search).get('theme'))

  debug()
}
