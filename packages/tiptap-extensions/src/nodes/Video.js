import {
  Node,
  Plugin
} from 'tiptap'
import {
  nodeInputRule
} from 'tiptap-commands'

const VIDEO_INPUT_REGEX = /!\[(.+|:?)]\((\S+)(?:(?:\s+)["'](\S+)["'])?\)/

export default class Video extends Node {

  get name() {
    return 'video'
  }

  get schema() {
    return {
      inline: true,
      attrs: {
        src: {},
      },
      group: 'inline',
      draggable: true,
      parseDOM: [{
        tag: 'video',
        getAttrs: dom => ({
          src: dom.getAttribute('src'),
        }),
      },],
      toDOM: node => ['video', {
        'controls': true,
        'style': 'width: 100%',
      },
        ['source', node.attrs]
      ],
    }
  }

  commands({
    type
  }) {
    return attrs => (state, dispatch) => {
      const {
        selection
      } = state
      const position = selection.$cursor ? selection.$cursor.pos : selection.$to.pos
      const node = type.create(attrs)
      const transaction = state.tr.insert(position, node)
      dispatch(transaction)
    }
  }

  inputRules({
    type
  }) {
    return [
      nodeInputRule(VIDEO_INPUT_REGEX, type, match => {
        const [, src,] = match
        return {
          src,
        }
      }),
    ]
  }

  get plugins() {
    return [
      new Plugin({
        props: {
          handleDOMEvents: {
            drop(view, event) {
              const hasFiles = event.dataTransfer &&
                event.dataTransfer.files &&
                event.dataTransfer.files.length

              if (!hasFiles) {
                return
              }

              const videos = Array
                .from(event.dataTransfer.files)
                .filter(file => (/video/i).test(file.type))

              if (videos.length === 0) {
                return
              }

              event.preventDefault()

              const {
                schema
              } = view.state
              const coordinates = view.posAtCoords({
                left: event.clientX,
                top: event.clientY
              })

              videos.forEach(video => {
                const reader = new FileReader()

                reader.onload = readerEvent => {
                  const node = schema.nodes.video.create({
                    src: readerEvent.target.result,
                  })
                  const transaction = view.state.tr.insert(coordinates.pos, node)
                  view.dispatch(transaction)
                }
                reader.readAsDataURL(video)
              })
            },
          },
        },
      }),
    ]
  }

}
