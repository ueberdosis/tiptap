import type { ResizableNodeViewDirection } from '@tiptap/core'
import { mergeAttributes, Node, nodeInputRule, ResizableNodeView } from '@tiptap/core'

export interface ImageOptions {
  inline: boolean
  allowBase64: boolean
  HTMLAttributes: Record<string, any>
  resize?: {
    enabled: boolean
    directions?: ResizableNodeViewDirection[]
    minWidth?: number
    minHeight?: number
    alwaysPreserveAspectRatio?: boolean
  }
}

const inputRegex = /(?:^|\s)(!\[([^\]]*)]\(([^\s)]+)(?:\s+['"]([^'"]*)['"])?\))/

const Image = Node.create({
  name: 'image',

  content: 'inline*',

  addAttributes() {
    return {
      src: { default: null },
      alt: { default: null },
      title: { default: null },
      showCaption: { default: false },
    }
  },

  parseHTML() {
    const imgTag = this.options.allowBase64 ? 'img[src]' : 'img[src]:not([src^="data:"])'
    return [
      {
        tag: 'figure',
        getAttrs: el => {
          if (!(el instanceof HTMLElement)) {
            return false
          }
          const img = el.querySelector('img')
          if (!img) {
            return false
          }
          const src = img.getAttribute('src')
          if (!src) {
            return false
          }
          if (!this.options.allowBase64 && src.startsWith('data:')) {
            return false
          }
          return {
            src,
            alt: img.getAttribute('alt'),
            title: img.getAttribute('title'),
            showCaption: Boolean(el.querySelector('figcaption')),
          }
        },
        contentElement: 'figcaption',
      },
      { tag: imgTag },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    const attrs = mergeAttributes(this.options.HTMLAttributes, HTMLAttributes)
    const shouldShowCaption = Boolean((HTMLAttributes as any)?.showCaption)
    if (!shouldShowCaption) {
      return ['img', attrs]
    }
    return ['figure', {}, ['img', attrs], ['figcaption', { 'data-node-view-content': 'true' }, 0]]
  },

  addNodeView() {
    if (typeof document === 'undefined') {
      return null
    }
    const resize = this.options.resize
    if (!resize || !resize.enabled) {
      return ({ node, HTMLAttributes }) => {
        const wrapper = document.createElement('figure')
        const img = document.createElement('img')
        Object.entries(HTMLAttributes ?? {}).forEach(([key, value]) => {
          if (value == null) {
            return
          }
          if (key === 'class') {
            img.className = String(value)
            return
          }
          img.setAttribute(key, String(value))
        })
        img.src = (HTMLAttributes as any)?.src ?? node.attrs.src
        wrapper.appendChild(img)
        const shouldShowCaption = Boolean(node.attrs.showCaption) || node.content.size > 0
        let contentDOM: HTMLElement | null = null
        if (shouldShowCaption) {
          const figcaption = document.createElement('figcaption')
          figcaption.setAttribute('data-node-view-content', 'true')
          wrapper.appendChild(figcaption)
          contentDOM = figcaption
        }
        return { dom: wrapper, contentDOM }
      }
    }
    const { directions, minWidth, minHeight, alwaysPreserveAspectRatio } = resize
    return ({ node, getPos, HTMLAttributes, editor }) => {
      const el = document.createElement('img')
      Object.entries(HTMLAttributes ?? {}).forEach(([key, value]) => {
        if (value != null) {
          switch (key) {
            case 'width':
            case 'height':
              break
            default:
              el.setAttribute(key, String(value))
              break
          }
        }
      })
      el.src = (HTMLAttributes as any)?.src ?? node.attrs.src
      const nodeView = new ResizableNodeView({
        element: el,
        editor,
        node,
        getPos,
        onResize: (width, height) => {
          el.style.width = `${width}px`
          el.style.height = `${height}px`
        },
        onCommit: (width, height) => {
          const pos = getPos()
          if (pos === undefined) {
            return
          }
          editor.chain().setNodeSelection(pos).updateAttributes(this.name, { width, height }).run()
        },
        onUpdate: updatedNode => updatedNode.type === node.type,
        options: {
          directions,
          min: { width: minWidth, height: minHeight },
          preserveAspectRatio: alwaysPreserveAspectRatio === true,
        },
      })
      const dom = nodeView.dom as HTMLElement
      dom.style.visibility = 'hidden'
      dom.style.pointerEvents = 'none'
      el.onload = () => {
        dom.style.visibility = ''
        dom.style.pointerEvents = ''
      }
      return nodeView
    }
  },

  addCommands() {
    return {
      setImage:
        (options: Record<string, any>) =>
        ({ commands }: { commands: import('@tiptap/core').RawCommands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: options,
          })
        },
    }
  },

  addInputRules() {
    return [
      nodeInputRule({
        find: inputRegex,
        type: this.type,
        getAttributes: (match: RegExpMatchArray) => {
          const [, , alt, src, title] = match
          return { src, alt, title }
        },
      }),
    ]
  },
})

export { Image }
export default Image
