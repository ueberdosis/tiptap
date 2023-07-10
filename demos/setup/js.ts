import 'iframe-resizer/js/iframeResizer.contentWindow'
import './style.scss'

import { debug } from './helper.js'

export default function init(name: string, source: any) {
  // @ts-ignore
  window.source = source
  document.title = name

  debug()
}
