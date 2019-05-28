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

    if (!this.searchTerm) {
      return
    }

    const search = this.findRegExp

    doc.descendants((node, pos) => {
      if (node.isText) {
        let m
        while (m = search.exec(node.text)) {
          this.results.push({
            from: pos + m.index,
            to: pos + m.index + m[0].length,
          })
        }
      }
    })
  }

  find(searchTerm) {
    return ({ doc, tr }, dispatch) => {
      this.options.searching = true
      this.searchTerm = searchTerm

      this._search(doc)

      dispatch(tr)
    }
  }

  createDeco(doc) {
    return this.decorations ? DecorationSet.create(doc, this.decorations) : []
  }

  get plugins() {
    return [
      new Plugin({
        state: {
          init: (_, { doc }) => this.createDeco(doc),
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
