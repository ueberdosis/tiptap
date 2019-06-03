import { Extension, Plugin } from 'tiptap'
import { Decoration, DecorationSet } from 'prosemirror-view'

export default class Search extends Extension {

  constructor(options = {}) {
    super(options)

    this.results = []
    this.searchTerm = null
    this._updating = false
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
      disableRegex: true,
      alwaysSearch: false,
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
      replace: attrs => this.replace(attrs),
      replaceAll: attrs => this.replaceAll(attrs),
      clearSearch: () => this.clear(),
      toggleSearch: () => this.toggleSearch(),
    }
  }

  get findRegExp() {
    return RegExp(this.searchTerm, !this.options.caseSensitive ? 'gui' : 'gu')
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

  replace(replace) {
    return (state, dispatch) => {
      const { from, to } = this.results[0]

      dispatch(state.tr.insertText(replace, from, to))
    }
  }

  rebaseNextResult(replace, index) {
    const nextIndex = index + 1
    if (!this.results[nextIndex]) return

    const nextStep = this.results[nextIndex]
    const { from, to } = nextStep
    const offset = (to - from - replace.length) * nextIndex

    this.results[nextIndex] = {
      to: to - offset,
      from: from - offset,
    }
  }

  replaceAll(replace) {
    return ({ tr }, dispatch) => {
      this.results.forEach(({ from, to }, index) => {
        tr.insertText(replace, from, to)

        this.rebaseNextResult(replace, index)
      })

      dispatch(tr)
    }
  }

  find(searchTerm) {
    return (state, dispatch) => {
      this.searchTerm = (this.options.disableRegex) ? searchTerm.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&') : searchTerm

      this.updateView(state, dispatch)
    }
  }

  clear() {
    return (state, dispatch) => {
      this.searchTerm = null

      this.updateView(state, dispatch)
    }
  }

  updateView({ tr }, dispatch) {
    this._updating = true
    dispatch(tr)
    this._updating = false
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
            if (this._updating
                || this.options.searching
                || (tr.docChanged && this.options.alwaysSearch)) {
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
