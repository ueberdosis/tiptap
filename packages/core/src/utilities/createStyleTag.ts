import type { BrowserEnvironmentManager } from '../BrowserEnvironment.js'

export function createStyleTag(
  style: string,
  nonce?: string,
  suffix?: string,
  browserEnv?: BrowserEnvironmentManager,
): HTMLStyleElement {
  // Use provided browser environment or fall back to global document
  const doc = browserEnv?.document ?? (typeof document !== 'undefined' ? document : undefined)

  if (!doc) {
    throw new Error('[tiptap error]: No document available for style injection')
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
