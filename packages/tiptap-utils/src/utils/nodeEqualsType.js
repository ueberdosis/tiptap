export default function nodeEqualsType({ types, node }) {
  return (Array.isArray(types) && types.includes(node.type)) || node.type === types
}
