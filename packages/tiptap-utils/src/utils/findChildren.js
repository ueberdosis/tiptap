import flatten from './flatten'

export default function findChildren(node, predicate, descend) {
  if (!node) {
    throw new Error('Invalid "node" parameter')
  } else if (!predicate) {
    throw new Error('Invalid "predicate" parameter')
  }
  return flatten(node, descend).filter(child => predicate(child.node))
}
