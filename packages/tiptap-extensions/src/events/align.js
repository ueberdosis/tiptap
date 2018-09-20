export default function align ({
  alignment = 'right',
  extensions,
  state,
  view
}) {
  for (let ext of extensions) {
    if (ext.plugins &&
      /alignment/.test(ext.plugins[0].key) &&
      ext.options.hasOwnProperty('alignmentClass')) {
      ext.options.alignmentClass = alignment
      const decorations = ext.decorate(state, view)
      break
    }
  }
}
