import { Node } from 'tiptap'

export default class CustomProps extends Node {

  get name() {
    return 'custom_props'
  }

  get schema() {
    return {
      attrs: {},
      group: 'block',
      selectable: true,
      parseDOM: [{
        tag: 'custom-props',
      }],
      toDOM: node => ['custom-props', {}],
    }
  }

  get view() {
    return {
      props: ['tiptap', 'custom', 'component'],
      template: `
        <div class="custom-props"><h3>Inside of the editor</h3>custom: {{ custom.customString }}<p>editable: {{ tiptap.editable }}</p><p>{{ component.selected }}</p></div>
      `,
    }
  }

}
