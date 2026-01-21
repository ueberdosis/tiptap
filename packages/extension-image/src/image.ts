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
      return ({ node, HTMLAttributes }) => {
        let currentNode: typeof node = node

        const wrapper = document.createElement('figure')
        const img = document.createElement('img')
        const figcaption = document.createElement('figcaption')

        // ProseMirror가 이 엘리먼트를 "편집 가능한 contentDOM"으로 인식
        figcaption.setAttribute('data-node-view-content', 'true')

        // 기존 image.ts 스타일과 동일하게 HTMLAttributes를 img에 적용
        Object.entries(HTMLAttributes).forEach(([key, value]) => {
          if (value == null) {return}

          switch (key) {
            case 'src':
            case 'alt':
            case 'title':
              img.setAttribute(key, String(value))
              break
            default:
              if (typeof value === 'boolean') {
                if (value) {img.setAttribute(key, '')}
              } else {
                img.setAttribute(key, String(value))
              }
          }
        })

        const syncFromNode = (n: typeof currentNode) => {
          // node attrs 기준으로 핵심 속성 동기화
          const { src, alt, title, width, height, showCaption } = n.attrs as any

          if (src != null) {img.setAttribute('src', String(src))}
          else {img.removeAttribute('src')}

          if (alt != null) {img.setAttribute('alt', String(alt))}
          else {img.removeAttribute('alt')}

          if (title != null) {img.setAttribute('title', String(title))}
          else {img.removeAttribute('title')}

          if (width != null) {img.setAttribute('width', String(width))}
          else {img.removeAttribute('width')}

          if (height != null) {img.setAttribute('height', String(height))}
          else {img.removeAttribute('height')}

          // contentDOM은 항상 유지하고, UI만 숨김/표시
          figcaption.style.display = showCaption ? '' : 'none'
        }

        syncFromNode(currentNode)

        wrapper.appendChild(img)
        wrapper.appendChild(figcaption)

        return {
          dom: wrapper,
          contentDOM: figcaption,

          update: (updatedNode: unknown) => {
            // Cast updatedNode to the correct type
            const typedNode = updatedNode as typeof node
            if (typedNode.type !== currentNode.type) {
              return false
            }
            currentNode = typedNode
            syncFromNode(currentNode)
            return true
          },
        }
      }
    }

    // 2) resize 활성: 기존 ResizableNodeView (여기는 현재 파일의 로직을 그대로 유지)
    const { directions, minWidth, minHeight, alwaysPreserveAspectRatio } = this.options.resize

    return ({ node: _node, getPos, HTMLAttributes, editor }) => {
      // ✅ 이 아래는 기존 코드 그대로 두세요 (PR #7431에서 "변경 없음"이라고 한 블록)
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
        editor,
        getPos,
        options: {
          directions,
          minWidth,
          minHeight,
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
