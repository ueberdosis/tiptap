import ComponentView from './ComponentView'

export default function initNodeViews({ parent, nodes, editable }) {
  const nodeViews = {}

  Object.keys(nodes).forEach(nodeName => {
    nodeViews[nodeName] = (node, view, getPos, decorations) => {
      const component = nodes[nodeName]

      return new ComponentView(component, {
        parent,
        node,
        view,
        getPos,
        decorations,
        editable,
      })
    }
  })

  return nodeViews
}
