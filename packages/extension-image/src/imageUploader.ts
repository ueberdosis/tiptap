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
      src: typeof fileOrUrl === 'string' ? fileOrUrl : URL.createObjectURL(fileOrUrl),
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
