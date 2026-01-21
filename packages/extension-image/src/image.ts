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
        getAttrs: (el: any) => {
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
    // SSR 방어
    if (typeof document === 'undefined') {
      return null
    }

    // 1) resize 비활성: figure + figcaption NodeView
    if (!this.options.resize || !this.options.resize.enabled) {
      return ({ node, HTMLAttributes }: { node: any; HTMLAttributes: Record<string, any> }) => {
        let currentNode = node

        const wrapper = document.createElement('figure')
        const img = document.createElement('img')
        const figcaption = document.createElement('figcaption')
        figcaption.setAttribute('data-node-view-content', 'true')

        Object.entries(HTMLAttributes).forEach(([key, value]) => {
          if (value == null) {
            return
          }
          switch (key) {
            case 'src':
            case 'alt':
            case 'title':
              img.setAttribute(key, String(value))
              break
            default:
              if (typeof value === 'boolean') {
                if (value) {
                  img.setAttribute(key, '')
                }
              } else {
                img.setAttribute(key, String(value))
              }
          }
        })

        const syncFromNode = (n: any) => {
          const { src, alt, title, width, height, showCaption } = n.attrs || {}
          if (src != null) {
            img.setAttribute('src', String(src))
          } else {
            img.removeAttribute('src')
          }
          if (alt != null) {
            img.setAttribute('alt', String(alt))
          } else {
            img.removeAttribute('alt')
          }
          if (title != null) {
            img.setAttribute('title', String(title))
          } else {
            img.removeAttribute('title')
          }
          if (width != null) {
            img.setAttribute('width', String(width))
          } else {
            img.removeAttribute('width')
          }
          if (height != null) {
            img.setAttribute('height', String(height))
          } else {
            img.removeAttribute('height')
          }
          figcaption.style.display = showCaption ? '' : 'none'
        }

        syncFromNode(currentNode)
        wrapper.appendChild(img)
        wrapper.appendChild(figcaption)

        return {
          dom: wrapper,
          contentDOM: figcaption,
          update: (updatedNode: any) => {
            if (updatedNode.type !== currentNode.type) {
              return false
            }
            currentNode = updatedNode
            syncFromNode(currentNode)
            return true
          },
        }
      }
    }

    // 2) resize 활성: 기존 ResizableNodeView (변경 없음)
    const { directions, minWidth, minHeight, alwaysPreserveAspectRatio } = this.options.resize
    return (props: any) => {
      const { node, getPos, HTMLAttributes, editor } = props // node는 ResizableNodeView에 전달됨
      const el = document.createElement('img')
      Object.entries(HTMLAttributes).forEach(([key, value]) => {
        if (value != null) {
          switch (key) {
            case 'src':
            case 'alt':
            case 'title':
              el.setAttribute(key, String(value))
              break
            default:
              if (typeof value === 'boolean') {
                if (value) {
                  el.setAttribute(key, '')
                }
              } else {
                el.setAttribute(key, String(value))
              }
          }
        }
      })
      el.src = String(HTMLAttributes.src)
      const nodeView = new ResizableNodeView({
        element: el,
        node,
        editor,
        getPos: typeof getPos === 'function' ? getPos : () => undefined,
        onCommit: (width: number, height: number) => {
          if (typeof getPos === 'function') {
            const pos = getPos()
            if (pos !== undefined) {
              editor.commands.updateAttributes('image', { width, height })
            }
          }
        },
        onUpdate: () => true,
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
    } as Partial<import('@tiptap/core').RawCommands>
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
