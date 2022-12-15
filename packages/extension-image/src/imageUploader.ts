import { Fragment, Node, Slice } from 'prosemirror-model'
import { Plugin, Transaction } from 'prosemirror-state'
import { EditorView } from 'prosemirror-view'

import type { ImageInfo, ImageOptions } from './image'
import { ReplaceAttrsStep } from './prosemirror-replaceattrs'

declare module 'prosemirror-state' {
  interface Transaction {
    /**
     * Replace the attributes the `attrs` of the node at the give `pos`.
     *
     * @param pos - Position of the node at the document.
     * @param attrs - New attrs to set.
     * @returns new Transaction with replace attrs step added.
     *
     */
    replaceAttrs(pos: number, attrs: any): Transaction;
  }
}

// eslint-disable-next-line func-names
Transaction.prototype.replaceAttrs = function replaceAttrs(
  pos: number,
  attrs: any,
): Transaction {
  return this.step(new ReplaceAttrsStep(pos, attrs))
}

const uploadFailedSvg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="none" d="M0 0h24v24H0z"/><path d="M3.515 2.1l19.092 19.092-1.415 1.415-2.014-2.015A5.985 5.985 0 0 1 17 21H7A6 6 0 0 1 5.008 9.339a6.992 6.992 0 0 1 .353-2.563L2.1 3.514 3.515 2.1zM7 9c0 .081.002.163.006.243l.07 1.488-1.404.494A4.002 4.002 0 0 0 7 19h10c.186 0 .369-.013.548-.037L7.03 8.445C7.01 8.627 7 8.812 7 9zm5-7a7 7 0 0 1 6.992 7.339 6.003 6.003 0 0 1 3.212 8.65l-1.493-1.493a3.999 3.999 0 0 0-5.207-5.206L14.01 9.795C14.891 9.29 15.911 9 17 9a5 5 0 0 0-7.876-4.09l-1.43-1.43A6.97 6.97 0 0 1 12 2z"/></svg>'

export class ImageUploaderPlugin {
  public view!: EditorView

  constructor(public config: ImageOptions) {
    this.config = config
  }

  public transformPasted(slice: Slice) {
    const imageNodes: Array<{ url: string; id: string }> = []

    const children: Node[] = []

    slice.content.forEach(child => {
      let newChild = child

      /// if the node itself is image
      if (child.type.name === 'image') {
        newChild = this.newUploadingImageNode(child.attrs)
        imageNodes.push({
          id: newChild.attrs.id,
          url: child.attrs.src,
        })
      } else {
        child.descendants((node, pos) => {
          if (node.type.name === 'image') {
            const imageNode = this.newUploadingImageNode(node.attrs)

            newChild = newChild.replace(
              pos,
              pos + 1,
              new Slice(Fragment.from(imageNode), 0, 0),
            )
            imageNodes.push({
              id: imageNode.attrs.id,
              url: node.attrs.src,
            })
          }
        })
      }

      children.push(newChild)
    })

    imageNodes.forEach(({ url, id }) => this.uploadImageForId(url, id))

    return new Slice(
      Fragment.fromArray(children),
      slice.openStart,
      slice.openEnd,
    )
  }

  public handleDrop(event: DragEvent) {
    if (!event.dataTransfer?.files.length) {
      return
    }

    const coordinates = this.view.posAtCoords({
      left: event.clientX,
      top: event.clientY,
    })

    if (!coordinates) {
      return
    }

    this.uploadImageFiles(event.dataTransfer.files, coordinates.pos)

    return true
  }

  public newUploadingImageNode(attrs?: any): Node {
    return this.view.state.schema.nodes.image.create({
      ...attrs,
      src: this.config.placeholderSrc,
      id: this.config.id(),
    })
  }

  public async uploadImageForId(fileOrUrl: File | string, id: string) {
    const getImagePositions = () => {
      const positions: Array<{ node: Node; pos: number }> = []

      this.view.state.doc.descendants((node, pos) => {

        if (node.type.name === 'image' && node.attrs.id === id) {

          positions.push({ node, pos })
        }
      })

      return positions
    }

    // wait unitl the placehold image is inserted
    await Promise.resolve()
    const imageNodes = getImagePositions()

    let imageInfo: ImageInfo = {
      src: `data:image/svg+xml,${uploadFailedSvg}`,
    }

    if (imageNodes.length && this.config.upload) {
      try {
        imageInfo = await this.config.upload(fileOrUrl)
      } catch (error) {
        console.error(error)
      }
    }

    let tr = this.view.state.tr
      /// disallow user from undoing back to 'uploading' state.
      .setMeta('addToHistory', false)

    imageNodes.forEach(({ node, pos }) => {

      tr = tr.replaceAttrs(pos, {
        ...node.attrs,
        id: null,
        ...imageInfo,
      })
    })

    this.view.dispatch(tr)
  }

  public uploadImageFiles(files: ArrayLike<File>, at: number) {
    const imageFiles = Array.from(files).filter(file => this.config.types.includes(file.type))

    if (!imageFiles.length) {
      return
    }

    imageFiles.forEach((image, i) => {
      this.uploadImage(image, at + i)
    })
  }

  public uploadImage(fileOrUrl: File | string, at: number) {
    const tr = this.view.state.tr

    if (!tr.selection.empty) {
      tr.deleteSelection()
    }

    /// insert image node.
    const node = this.newUploadingImageNode()

    this.view.dispatch(tr.replaceWith(at, at, node))

    /// upload image for above node
    this.uploadImageForId(fileOrUrl, node.attrs.id)
  }

  public setView(view: EditorView): this {
    this.view = view
    return this
  }
}

export default function imageUploader(
  options: ImageOptions,
) {

  const plugin = new ImageUploaderPlugin({ ...options })

  return new Plugin({
    props: {
      handleDOMEvents: {
        keydown(view) {
          return !plugin.setView(view)
        },

        drop(view) {
          return !plugin.setView(view)
        },

        focus(view) {
          return !plugin.setView(view)
        },
      },

      transformPasted(slice) {
        /// Workaround for missing view is provided above.
        return plugin.transformPasted(slice)
      },

      handleDrop(view, event) {
        return plugin.setView(view).handleDrop(event as DragEvent) || false
      },
    },
  })
}
