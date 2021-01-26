export default function flatten(node) {
  // eslint-disable-next-line
  const descend = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true

  if (!node) {
    throw new Error('Invalid "node" parameter')
  }
  const result = []
  // eslint-disable-next-line
  node.descendants((child, pos) => {
    result.push({ node: child, pos })
    if (!descend) {
      return false
    }
  })
  return result
}
