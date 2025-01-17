# Change Log

## 3.0.0-next.4

### Major Changes

- 6a53bb2: # @tiptap/static-renderer

  The `@tiptap/static-renderer` package provides a way to render a Tiptap/ProseMirror document to any target format, like an HTML string, a React component, or even markdown. It does so, by taking the original JSON of a document (or document partial) and attempts to map this to the output format, by matching against a list of nodes & marks.

  ## Why Static Render?

  The main use case for static rendering is to render a Tiptap/ProseMirror document on the server-side, for example in a Next.js or Nuxt.js application. This way, you can render the content of your editor to HTML before sending it to the client, which can improve the performance of your application.

  Another use case is to render the content of your editor to another format like markdown, which can be useful if you want to send it to a markdown-based API.

  But what makes it static? The static renderer doesn't require a browser or a DOM to render the content. It's a pure JavaScript function that takes a document (as JSON or Prosemirror Node instance) and returns the target format back.

  ## Example

  Render a Tiptap document to an HTML string:

  ```js
  import StarterKit from '@tiptap/starter-kit'
  import { renderToHTMLString } from '@tiptap/static-renderer'

  renderToHTMLString({
    extensions: [StarterKit], // using your extensions
    // we can map nodes and marks to HTML elements
    options: {
      nodeMapping: {
        // custom node mappings
      },
      markMapping: {
        // custom mark mappings
      },
      unhandledNode: ({ node }) => {
        // handle unhandled nodes
        return `[unknown node ${node.type.name}]`
      },
      unhandledMark: ({ mark }) => {
        // handle unhandled marks
        return `[unknown node ${mark.type.name}]`
      },
    },
    // the source content to render
    content: {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'Hello World!',
            },
          ],
        },
      ],
    },
  })
  // returns: '<p>Hello World!</p>'
  ```

  Render to a React component:

  ```js
  import StarterKit from '@tiptap/starter-kit'
  import { renderToReactElement } from '@tiptap/static-renderer'

  renderToReactElement({
    extensions: [StarterKit], // using your extensions
    // we can map nodes and marks to HTML elements
    options: {
      nodeMapping: {
        // custom node mappings
      },
      markMapping: {
        // custom mark mappings
      },
      unhandledNode: ({ node }) => {
        // handle unhandled nodes
        return `[unknown node ${node.type.name}]`
      },
      unhandledMark: ({ mark }) => {
        // handle unhandled marks
        return `[unknown node ${mark.type.name}]`
      },
    },
    // the source content to render
    content: {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'Hello World!',
            },
          ],
        },
      ],
    },
  })
  // returns a react node that, when evaluated, would be equivalent to: '<p>Hello World!</p>'
  ```

  There are a number of options available to customize the output, like custom node and mark mappings, or handling unhandled nodes and marks.

  ## API

  ### `renderToHTMLString`

  ```ts
  function renderToHTMLString(options: {
    extensions: Extension[]
    content: ProsemirrorNode | JSONContent
    options?: TiptapHTMLStaticRendererOptions
  }): string
  ```

  #### `renderToHTMLString` Options

  - `extensions`: An array of Tiptap extensions that are used to render the content.
  - `content`: The content to render. Can be a Prosemirror Node instance or a JSON representation of a Prosemirror document.
  - `options`: An object with additional options.
  - `options.nodeMapping`: An object that maps Prosemirror nodes to HTML strings.
  - `options.markMapping`: An object that maps Prosemirror marks to HTML strings.
  - `options.unhandledNode`: A function that is called when an unhandled node is encountered.
  - `options.unhandledMark`: A function that is called when an unhandled mark is encountered.

  ### `renderToReactElement`

  ```ts
  function renderToReactElement(options: {
    extensions: Extension[]
    content: ProsemirrorNode | JSONContent
    options?: TiptapReactStaticRendererOptions
  }): ReactElement
  ```

  #### `renderToReactElement` Options

  - `extensions`: An array of Tiptap extensions that are used to render the content.
  - `content`: The content to render. Can be a Prosemirror Node instance or a JSON representation of a Prosemirror document.
  - `options`: An object with additional options.
  - `options.nodeMapping`: An object that maps Prosemirror nodes to React components.
  - `options.markMapping`: An object that maps Prosemirror marks to React components.
  - `options.unhandledNode`: A function that is called when an unhandled node is encountered.
  - `options.unhandledMark`: A function that is called when an unhandled mark is encountered.

  ## How does it work?

  Each Tiptap node/mark extension can define a `renderHTML` method which is used to generate default mappings of Prosemirror nodes/marks to the target format. These can be overridden by providing custom mappings in the options. One thing to note is that the static renderer doesn't support node views automatically, so you need to provide a mapping for each node type that you want rendered as a node view. Here is an example of how you can render a node view as a React component:

  ```js
  import { Node } from '@tiptap/core'
  import { ReactNodeViewRenderer } from '@tiptap/react'
  import StarterKit from '@tiptap/starter-kit'
  import { renderToReactElement } from '@tiptap/static-renderer'

  // This component does not have a NodeViewContent, so it does not render it's children's rich text content
  function MyCustomComponentWithoutContent() {
    const [count, setCount] = React.useState(200)

    return (
      <div className='custom-component-without-content' onClick={() => setCount(a => a + 1)}>
        {count} This is a react component!
      </div>
    )
  }

  const CustomNodeExtensionWithoutContent = Node.create({
    name: 'customNodeExtensionWithoutContent',
    atom: true,
    renderHTML() {
      return ['div', { class: 'my-custom-component-without-content' }] as const
    },
    addNodeView() {
      return ReactNodeViewRenderer(MyCustomComponentWithoutContent)
    },
  })

  renderToReactElement({
    extensions: [StarterKit, CustomNodeExtensionWithoutContent],
    options: {
      nodeMapping: {
        // render the custom node with the intended node view React component
        customNodeExtensionWithoutContent: MyCustomComponentWithoutContent,
      },
    },
    content: {
      type: 'doc',
      content: [
        {
          type: 'customNodeExtensionWithoutContent',
        },
      ],
    },
  })
  // returns: <div class="my-custom-component-without-content">200 This is a react component!</div>
  ```

  But what if you want to render the rich text content of the node view? You can do that by providing a `NodeViewContent` component as a child of the node view component:

  ```js
  import { Node } from '@tiptap/core'
  import {
    NodeViewContent,
    ReactNodeViewContentProvider,
    ReactNodeViewRenderer
  } from '@tiptap/react'
  import StarterKit from '@tiptap/starter-kit'
  import { renderToReactElement } from '@tiptap/static-renderer'


  // This component does have a NodeViewContent, so it will render it's children's rich text content
  function MyCustomComponentWithContent() {
    return (
      <div className="custom-component-with-content">
        Custom component with content in React!
        <NodeViewContent />
      </div>
    )
  }


  const CustomNodeExtensionWithContent = Node.create({
    name: 'customNodeExtensionWithContent',
    content: 'text*',
    group: 'block',
    renderHTML() {
      return ['div', { class: 'my-custom-component-with-content' }, 0] as const
    },
    addNodeView() {
      return ReactNodeViewRenderer(MyCustomComponentWithContent)
    },
  })


  renderToReactElement({
    extensions: [StarterKit, CustomNodeExtensionWithContent],
    options: {
      nodeMapping: {
        customNodeExtensionWithContent: ({ children }) => {
          // To pass the content down into the NodeViewContent component, we need to wrap the custom component with the ReactNodeViewContentProvider
          return (
            <ReactNodeViewContentProvider content={children}>
              <MyCustomComponentWithContent />
            </ReactNodeViewContentProvider>
          )
        },
      },
    },
    content: {
      type: 'doc',
      content: [
        {
          type: 'customNodeExtensionWithContent',
          // rich text content
          content: [
            {
              type: 'text',
              text: 'Hello, world!',
            },
          ],
        },
      ],
    },
  })

  // returns: <div class="custom-component-with-content">Custom component with content in React!<div data-node-view-content="" style="white-space:pre-wrap">Hello, world!</div></div>
  // Note: The NodeViewContent component is rendered as a div with the attribute data-node-view-content, and the rich text content is rendered inside of it
  ```