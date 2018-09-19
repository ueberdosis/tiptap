export default function align (state, decorations = []) {
  for (let plugin of state.plugins) {
    if (plugin.key.match(/alignment/)) {
      return plugin.options.alignmentClass = 'TEST' // decorations(state, 'TEST')
      break
    }
  }
}
