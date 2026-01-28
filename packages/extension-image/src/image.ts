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

const Image = Node.create<ImageOptions>({
  name: 'image',

  // 원래 extension-image의 동작(옵션 inline)에 맞추려면 아래 두 개를 유지하는 게 안전합니다.
  inline() {
    return this.options.inline
  },

  group() {
    return this.options.inline ? 'inline' : 'block'
  },

  draggable: true,

  // 캡션을 담기 위해 content를 열어둡니다.
  // (showCaption=false라도 content가 있을 수 있으므로 serialize 시 보존 처리 필요)
  content: 'inline*',

  addOptions() {
    return {
      inline: false,
      allowBase64: false,
      HTMLAttributes: {},
      resize: undefined,
    }
  },

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
        getAttrs: (el: unknown) => {
          if (!(el instanceof HTMLElement)) {return false}

          const img = el.querySelector('img')
          if (!img) {return false}

          const src = img.getAttribute('src')
          if (!src) {return false}

          if (!this.options.allowBase64 && src.startsWith('data:')) {return false}

          return {
            src,
            alt: img.getAttribute('alt'),
            title: img.getAttribute('title'),
            // figcaption이 있으면 showCaption=true로 파싱
            showCaption: Boolean(el.querySelector('figcaption')),
          }
        },
        contentElement: 'figcaption',
      },
      { tag: imgTag },
    ]
  },

  // showCaption이 false여도 "이미 content가 있으면" figure로 내보내서 데이터 유실 방지
  // ProseMirror DOM spec에서 0(hole)이 node.content가 삽입될 자리입니다. :contentReference[oaicite:3]{index=3}
  renderHTML({ node, HTMLAttributes }) {
    const attrs = mergeAttributes(this.options.HTMLAttributes, HTMLAttributes)
    const hasCaptionContent = node.content.size > 0
    const shouldWrap = Boolean((node.attrs as any)?.showCaption) || hasCaptionContent

    if (!shouldWrap) {
      return ['img', attrs]
    }

    return ['figure', {}, ['img', attrs], ['figcaption', { 'data-node-view-content': 'true' }, 0]]
  },

  addNodeView() {
    // SSR 방어
    if (typeof document === 'undefined') {
      return null
    }

    const applyImgAttrs = (img: HTMLImageElement, attrs: Record<string, any>) => {
      Object.entries(attrs).forEach(([key, value]) => {
        if (value == null) {return}
        if (key === 'showCaption') {return} // img에 붙이지 않음

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
    }

    // 1) resize 비활성: figure + figcaption NodeView (contentDOM 고정 + display 토글)
    if (!this.options.resize || !this.options.resize.enabled) {
      return ({ node, HTMLAttributes }) => {
        let currentNode = node

        const wrapper = document.createElement('figure')
        const img = document.createElement('img')
        const figcaption = document.createElement('figcaption')

        figcaption.setAttribute('data-node-view-content', 'true')

        // HTMLAttributes(클래스 등) 반영 + showCaption 제외
        const mergedHTMLAttrs = mergeAttributes(this.options.HTMLAttributes, HTMLAttributes)
        applyImgAttrs(img, mergedHTMLAttrs)

        const syncFromNode = (n: typeof currentNode) => {
          const { src, alt, title, showCaption } = n.attrs as any

          if (src != null) {img.setAttribute('src', String(src))}
          else {img.removeAttribute('src')}

          if (alt != null) {img.setAttribute('alt', String(alt))}
          else {img.removeAttribute('alt')}

          if (title != null) {img.setAttribute('title', String(title))}
          else {img.removeAttribute('title')}

          // contentDOM은 항상 유지하고 UI만 숨김/표시
          figcaption.style.display = showCaption ? '' : 'none'
        }

        syncFromNode(currentNode)

        wrapper.appendChild(img)
        wrapper.appendChild(figcaption)

        return {
          dom: wrapper,
          contentDOM: figcaption,

          // NodeView.update는 (node, decorations, innerDecorations) 시그니처입니다. :contentReference[oaicite:4]{index=4}
          update: (updatedNode, _decorations, _innerDecorations) => {
            if (updatedNode.type !== currentNode.type) {return false}
            currentNode = updatedNode
            syncFromNode(currentNode)
            return true
          },
        }
      }
    }

    // 2) resize 활성: 기존 ResizableNodeView 유지
    const { directions, minWidth, minHeight, alwaysPreserveAspectRatio } = this.options.resize

    return ({ node: _node, getPos, HTMLAttributes, editor }) => {
      const el = document.createElement('img')

      const mergedHTMLAttrs = mergeAttributes(this.options.HTMLAttributes, HTMLAttributes)
      applyImgAttrs(el, mergedHTMLAttrs)

      el.src = String(mergedHTMLAttrs.src)

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
