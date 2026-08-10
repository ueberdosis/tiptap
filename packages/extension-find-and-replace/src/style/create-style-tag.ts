export const createStyleTag = (style: string, nonce?: string): HTMLStyleElement => {
  const existing = document.querySelector<HTMLStyleElement>(
    'style[data-tiptap-extension-find-and-replace-style]',
  )

  if (existing !== null) {
    return existing
  }

  const styleNode = document.createElement('style')

  if (nonce) {
    styleNode.setAttribute('nonce', nonce)
  }

  styleNode.setAttribute('data-tiptap-extension-find-and-replace-style', '')
  styleNode.textContent = style
  document.getElementsByTagName('head')[0].appendChild(styleNode)

  return styleNode
}

export default createStyleTag
