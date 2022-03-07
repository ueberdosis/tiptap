export function createStyleTag(style: string, nonce?: string): HTMLStyleElement {
  const tipTapStyleTag = (<HTMLStyleElement>document.querySelector('style[data-tiptap-style]'))

  if (tipTapStyleTag !== null) {
    return tipTapStyleTag
  }

  const styleNode = document.createElement('style')

  if (nonce) {
    styleNode.setAttribute('nonce', nonce)
  }

  styleNode.setAttribute('data-tiptap-style', '')
  styleNode.innerHTML = style
  document.getElementsByTagName('head')[0].appendChild(styleNode)

  return styleNode
}
