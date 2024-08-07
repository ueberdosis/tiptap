import { Decoration as PMDecoration } from '@tiptap/pm/view'

export abstract class Decoration {
  pos: number

  constructor(pos: number) {
    this.pos = pos
  }

  toProsemirrorDecoration(): PMDecoration | null {
    return null
  }

  toDOM() {
    return document.createElement('span')
  }
}
