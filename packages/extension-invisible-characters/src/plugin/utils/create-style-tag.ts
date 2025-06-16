export const createStyleTag = (style: string, nonce?: string): HTMLStyleElement => {
  const tiptapStyleTag = (<HTMLStyleElement>document.querySelector('style[data-tiptap-extension-invisible-characters-style]'))

  if (tiptapStyleTag !== null) {
    return tiptapStyleTag
  }

  const styleNode = document.createElement('style')

  if (nonce) {
    styleNode.setAttribute('nonce', nonce)
  }

  styleNode.setAttribute('data-tiptap-extension-invisible-characters-style', '')
  styleNode.innerHTML = style
  document.getElementsByTagName('head')[0].appendChild(styleNode)

  return styleNode
}

export default createStyleTag
