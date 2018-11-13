import { Node } from 'tiptap'

export default class IframeNode extends Node {

  get name() {
    return 'iframe'
  }

  get schema() {
    return {
      // here you have to specify all values that can be stored in this node
      attrs: {
        src: {
          default: null,
        },
      },
      group: 'block',
      selectable: false,
      // parseDOM and toDOM is still required to make copy and paste work
      parseDOM: [{
        tag: 'iframe',
        getAttrs: dom => ({
          src: dom.getAttribute('src'),
        }),
      }],
      toDOM: node => ['iframe', {
        src: node.attrs.src,
        frameborder: 0,
        allowfullscreen: 'true',
      }],
    }
  }

  // return a vue component
  // this can be an object or an imported component
  get view() {
    return {
      // there are some props available
      // `node` is a Prosemirror Node Object
      // `updateAttrs` is a function to update attributes defined in `schema`
      // `editable` is the global editor prop whether the content can be edited
      props: ['node', 'updateAttrs', 'editable'],
      data() {
        return {
          // save the iframe src in a new variable because `this.node.attrs` is immutable
          url: this.node.attrs.src,
        }
      },
      methods: {
        onChange(event) {
          this.url = event.target.value

          // update the iframe url
          this.updateAttrs({
            src: this.url,
          })
        },
      },
      template: `
        <div class="iframe">
          <iframe class="iframe__embed" :src="url"></iframe>
          <input class="iframe__input" type="text" :value="url" @input="onChange" v-if="editable" />
        </div>
      `,
    }
  }

}