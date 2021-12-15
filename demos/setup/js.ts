import 'iframe-resizer/js/iframeResizer.contentWindow'
import { debug } from './helper'
import './style.scss'

export default function init(name: string, source: any) {
  // @ts-ignore
  window.source = source
  document.title = name

  debug()
}
