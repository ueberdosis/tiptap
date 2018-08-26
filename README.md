# tiptap
A renderless and extendable rich-text editor for [Vue.js](https://github.com/vuejs/vue)

[![](https://img.shields.io/npm/v/tiptap.svg?label=version)](https://www.npmjs.com/package/tiptap)
[![](https://img.shields.io/npm/dm/tiptap.svg)](https://npmcharts.com/compare/tiptap?minimal=true)
[![](https://img.shields.io/npm/l/tiptap.svg)](https://www.npmjs.com/package/tiptap)
[![](http://img.badgesize.io/https://unpkg.com/tiptap/dist/tiptap.min.js?compression=gzip&label=size&colorB=000000)](https://www.npmjs.com/package/tiptap)

## Why I built tiptap
I was looking for a text editor for [Vue.js](https://github.com/vuejs/vue) and found some solutions that didn't really satisfy me. The editor should be easy to extend and not based on old dependencies such as jQuery. For React there is already a great editor called [Slate.js](https://github.com/ianstormtaylor/slate), which impresses with its modularity. I came across [Prosemirror](https://github.com/prosemirror) and decided to build on it. Prosemirror is a toolkit for building rich-text editors that is already in use at many well-known companies such as *Atlassian* or *New York Times*.

## Examples
To check out some live examples, visit [tiptap.scrumpy.io](https://tiptap.scrumpy.io/).

## Installation
```
npm install tiptap
```
or
```
yarn add tiptap
```

## Basic Setup
```vue
<template>
  <editor>
    <!-- Add HTML to the scoped slot called `content` -->
    <div slot="content" slot-scope="props">
      <p>Hi, I'm just a boring paragraph</p>
    </div>
  </editor>
</template>

<script>
// Import the editor
import { Editor } from 'tiptap'

export default {
  components: {
    Editor,
  },
}
</script>
```

## Editor Properties

| **Property** | **Type** | **Default** | **Description** |
| --- | :---: | :---: | --- |
| `editable` | `Boolean` | `true` | When set to `false` the editor is read-only. |
| `doc` | `Object` | `null` | The editor state object used by Prosemirror. You can also pass HTML to the `content` slot. When used both, the `content` slot will be ignored. |
| `extensions` | `Array` | `[]` | A list of extensions used, by the editor. This can be `Nodes`, `Marks` or `Plugins`. |
| `@update` | `Function` | `undefined` | This will return the current `state` of Prosemirror on every change. |

## Extensions

By default the editor will only support some boring paragraphs. Other nodes and marks are available as **extensions**. There is a package called `tiptap-extensions` with the most basic nodes, marks and plugins.

### Available Extensions

```vue
<template>
  <editor :extensions="extensions">
    <div slot="content" slot-scope="props">
      <h1>Yay Headlines!</h1>
      <p>All these <strong>cool tags</strong> are working now.</p>
    </div>
  </editor>
</template>

<script>
import { Editor } from 'tiptap'
import {
  Blockquote,
  BulletList,
  CodeBlock,
  HardBreak,
  Heading,
  ListItem,
  OrderedList,
  TodoItem,
  TodoList,
  Bold,
  Code,
  Italic,
  Link,
  History,
} from 'tiptap-extensions'

export default {
  components: {
    Editor,
  },
  data() {
    return {
      extensions: [
        new Blockquote(),
        new BulletList(),
        new CodeBlock(),
        new HardBreak(),
        new Heading({ maxLevel: 3 }),
        new ListItem(),
        new OrderedList(),
        new TodoItem(),
        new TodoList(),
        new Bold(),
        new Code(),
        new Italic(),
        new Link(),
        new History(),
      ],
    }
  },
}
</script>
```

### Create Custom Extensions

The most powerful feature of tiptap is that you can create you own extensions. There are 3 basic types of extensions.

| **Type** | **Description** |
| --- | --- |
| `Extension` | The most basic type. It's useful to register some [Prosemirror plugins](https://prosemirror.net/docs/guide/) or some input rules. |
| `Node` | Add a custom node. Nodes are basically block elements like a headline or a paragraph. |
| `Mark` | Add a custom mark. Marks are used to add extra styling or other information to inline content like a strong tag or links. |

### Extension Class

| **Method** | **Type** | **Default** | **Description** |
| --- | :---: | :---: | --- |
| `get name()` | `String` | `null` | Define a name for your extension. |
| `get defaultOptions()` | `Object` | `{}` | Define some default options. The options are available as `this.$options`. |
| `get plugins()` | `Array` | `[]` | Define a list of [Prosemirror plugins](https://prosemirror.net/docs/guide/). |
| `keys({ schema })` | `Object` | `null` | Define some keybindings. |
| `inputRules({ schema })` | `Array` | `[]` | Define a list of input rules. |

### Node|Mark Class

| **Method** | **Type** | **Default** | **Description** |
| --- | :---: | :---: | --- |
| `get name()` | `String` | `null` | Define a name for your node or mark. |
| `get defaultOptions()` | `Object` | `{}` | Define some default options. The options are available as `this.$options`. |
| `get schema()` | `Object` | `null` | Define a [schema](https://prosemirror.net/docs/guide/#schema). |
| `get view()` | `Object` | `null` | Define a node view as a vue component. |
| `keys({ type, schema })` | `Object` | `null` | Define some keybindings. |
| `command({ type, schema, attrs })` | `Object` | `null` | Define a command. This is used for menus to convert to this node or mark. |
| `inputRules({ type, schema })` | `Array` | `[]` | Define a list of input rules. |
| `get plugins()` | `Array` | `[]` | Define a list of [Prosemirror plugins](https://prosemirror.net/docs/guide/). |

### Create a Node

Let's take a look at a real example. This is basically how the default `blockquote` node from [`tiptap-extensions`](https://www.npmjs.com/package/tiptap-extensions) looks like.

```js
import { Node } from 'tiptap'
import { wrappingInputRule, setBlockType, wrapIn } from 'tiptap-commands'

export default class BlockquoteNode extends Node {

  // choose a unique name
  get name() {
    return 'blockquote'
  }

  // the prosemirror schema object
  // take a look at https://prosemirror.net/docs/guide/#schema for a detailed explanation
  get schema() {
    return {
      content: 'block+',
      group: 'block',
      defining: true,
      draggable: false,
      // define how the editor will detect your node from pasted HTML
      // every blockquote tag will be converted to this blockquote node
      parseDOM: [
        { tag: 'blockquote' },
      ],
      // this is how this node will be rendered
      // in this case a blockquote tag with a class called `awesome-blockquote` will be rendered
      // the '0' stands for its text content inside
      toDOM: () => ['blockquote', { class: 'awesome-blockquote' }, 0],
    }
  }

  // this command will be called from menus to add a blockquote
  // `type` is the prosemirror schema object for this blockquote
  // `schema` is a collection of all registered nodes and marks
  command({ type, schema }) {
    return wrapIn(type)
  }

  // here you can register some shortcuts
  // in this case you can create a blockquote with `ctrl` + `>`
  keys({ type }) {
    return {
      'Ctrl->': wrapIn(type),
    }
  }

  // a blockquote will be created when you are on a new line and type `>` followed by a space
  inputRules({ type }) {
    return [
      wrappingInputRule(/^\s*>\s$/, type),
    ]
  }

}
```

### Create a Node as a Vue Component

The real power of the nodes comes in combination with Vue components. Lets build a iframe node, where you can change its url (this can also be found in our [examples](https://github.com/heyscrumpy/tiptap/tree/master/examples/Components/Routes/Embeds)).

```js
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
```

## Contributing

Please see [CONTRIBUTING](CONTRIBUTING.md) for details.

## Credits

- [Philipp Kühn](https://github.com/philippkuehn)
- [All Contributors](../../contributors)

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.
