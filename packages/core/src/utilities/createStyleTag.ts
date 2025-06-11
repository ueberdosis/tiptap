import { BrowserEnvironment } from '../BrowserEnvironment.js'

export function createStyleTag(
  style: string,
  nonce?: string,
  suffix?: string,
  browserEnvironment: BrowserEnvironment = new BrowserEnvironment(),
): HTMLStyleElement {
  const doc = browserEnvironment?.document

  if (!doc) {
    throw new Error('[tiptap error]: No document available')
  }

  const tiptapStyleTag = <HTMLStyleElement>doc.querySelector(`style[data-tiptap-style${suffix ? `-${suffix}` : ''}]`)

  if (tiptapStyleTag !== null) {
    return tiptapStyleTag
  }

  const styleNode = doc.createElement('style')

  if (nonce) {
    styleNode.setAttribute('nonce', nonce)
  }

  styleNode.setAttribute(`data-tiptap-style${suffix ? `-${suffix}` : ''}`, '')
  styleNode.innerHTML = style
  doc.getElementsByTagName('head')[0].appendChild(styleNode)

  return styleNode
}
