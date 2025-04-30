export function createStyleTag(style: string, nonce?: string, suffix?: string): HTMLStyleElement {
  const tiptapStyleTag = <HTMLStyleElement>(
    document.querySelector(`style[data-tiptap-style${suffix ? `-${suffix}` : ''}]`)
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
  document.getElementsByTagName('head')[0].appendChild(styleNode)

  return styleNode
}
