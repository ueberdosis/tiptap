import { Node } from 'tiptap'

export default class ExtraProps extends Node {

  get name() {
    return 'extra_props'
  }

  get schema() {
    return {
      attrs: {},
      group: 'block',
      selectable: false,
      parseDOM: [{
        tag: 'extra-props',
      }],
      toDOM: node => ['extra-props', {}],
    }
  }

  get view() {
    return {
      props: ['node', 'updateAttrs', 'extraProps'],
      template: `
        <div class="extra-props"><h3>Inside of the editor</h3>{{ extraProps.fromOutsideTheEditor }}</div>
      `,
    }
  }

}
