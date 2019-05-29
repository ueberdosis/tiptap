import { Extension, Plugin } from 'tiptap'
import { Decoration, DecorationSet } from 'prosemirror-view'

export default class Search extends Extension {

  constructor(options = {}) {
    super(options)

    this.results = []
    this.searchTerm = null
  }

  get name() {
    return 'search'
  }

  init() {
    this.editor.events.push('toggleSearch')
  }

  get defaultOptions() {
    return {
      autoSelectNext: true,
      findClass: 'find',
      searching: false,
      caseSensitive: false,
    }
  }

  toggleSearch() {
    return () => {
      this.options.searching = !this.options.searching
      this.editor.emit('toggleSearch', this.options.searching)
      return true
    }
  }

  keys() {
    return {
      'Mod-f': this.toggleSearch(),
    }
  }

  commands() {
    return {
      find: attrs => this.find(attrs),
      toggleSearch: () => this.toggleSearch(),
    }
  }

  get findRegExp() {
    return RegExp(this.searchTerm, !this.options.caseSensitive ? 'gi' : 'g')
  }

  get decorations() {
    return this.results.map(deco => (
        Decoration.inline(deco.from, deco.to, { class: this.options.findClass })
    ))
  }

  _search(doc) {
    this.results = []
    const mergedTextNodes = []
    let index = 0

    if (!this.searchTerm) {
      return
    }

    doc.descendants((node, pos) => {
      if (node.isText) {
        if (mergedTextNodes[index]) {
          mergedTextNodes[index] = {
            text: mergedTextNodes[index].text + node.text,
            pos: mergedTextNodes[index].pos,
          }
        } else {
          mergedTextNodes[index] = {
            text: node.text,
            pos,
          }
        }
      } else {
        index += 1
      }
    })

    mergedTextNodes.forEach(({ text, pos }) => {
      const search = this.findRegExp
      let m
      while (m = search.exec(text)) {
        if (m[0] === '') {
          break
        }
        this.results.push({
          from: pos + m.index,
          to: pos + m.index + m[0].length,
        })
      }
    })
  }

  find(searchTerm) {
    return ({ tr }, dispatch) => {
      this.options.searching = true
      this.searchTerm = searchTerm

      dispatch(tr)
    }
  }

  createDeco(doc) {
    this._search(doc)
    return this.decorations ? DecorationSet.create(doc, this.decorations) : []
  }

  get plugins() {
    return [
      new Plugin({
        state: {
          init() { return DecorationSet.empty },
          apply: (tr, old) => {
            if (this.options.searching) {
              return this.createDeco(tr.doc)
            }
            if (tr.docChanged) {
              return old.map(tr.mapping, tr.doc)
            }
            return old
          },
        },
        props: {
          decorations(state) { return this.getState(state) },
        },
      }),
    ]
  }

}
