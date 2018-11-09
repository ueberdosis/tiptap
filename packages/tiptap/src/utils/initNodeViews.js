import ComponentView from './ComponentView'

export default function initNodeViews({ parent, extensions, editable }) {
  return extensions
    .filter(extension => ['node', 'mark'].includes(extension.type))
    .filter(extension => extension.view)
    .reduce((nodeViews, extension) => {
      const nodeView = (node, view, getPos, decorations) => {
        const component = extension.view

        return new ComponentView(component, {
          extension,
          parent,
          node,
          view,
          getPos,
          decorations,
          editable,
        })
      }

      return {
        ...nodeViews,
        [extension.name]: nodeView,
      }
    }, {})
}
