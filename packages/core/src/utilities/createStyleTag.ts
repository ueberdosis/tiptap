/**
 * Document styles do not cross a shadow boundary, so an editor inside a shadow root
 * needs the style tag in that root instead of `document.head`.
 */
export function createStyleTag(
  style: string,
  nonce?: string,
  suffix?: string,
  root: Document | ShadowRoot = document,
): HTMLStyleElement {
  const tiptapStyleTag = <HTMLStyleElement>(
    root.querySelector(`style[data-tiptap-style${suffix ? `-${suffix}` : ''}]`)
  )

  if (tiptapStyleTag !== null) {
    return tiptapStyleTag
  }

  const styleNode = document.createElement('style')

  if (nonce) {
    styleNode.setAttribute('nonce', nonce)
  }

  styleNode.setAttribute(`data-tiptap-style${suffix ? `-${suffix}` : ''}`, '')
  styleNode.innerHTML = style
  const parent = 'head' in root ? root.head : root

  parent.appendChild(styleNode)

  return styleNode
}
