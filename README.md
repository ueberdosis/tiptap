# tiptap
A renderless and extendable rich-text editor for [Vue.js](https://github.com/vuejs/vue)

| **Package** | **Version** | **Downloads** | **Description** |
| - | - | - | - |
| [`tiptap`](https://github.com/heyscrumpy/tiptap/tree/master/packages/tiptap) | [![](https://img.shields.io/npm/v/tiptap.svg?maxAge=2592000&label=version&colorB=000000)](https://www.npmjs.com/package/tiptap) | [![](https://img.shields.io/npm/dm/tiptap.svg?colorB=000000)](https://npmcharts.com/compare/tiptap?minimal=true) | The core package including the vue component. |
| [`tiptap-extensions`](https://github.com/heyscrumpy/tiptap/tree/master/packages/tiptap-extensions) | [![](https://img.shields.io/npm/v/tiptap-extensions.svg?maxAge=2592000&label=version&colorB=000000)](https://www.npmjs.com/package/tiptap-extensions) | [![](https://img.shields.io/npm/dm/tiptap-extensions.svg?colorB=000000)](https://npmcharts.com/compare/tiptap-extensions?minimal=true) | A collection of some basic extensions for tiptap. |
| [`tiptap-commands`](https://github.com/heyscrumpy/tiptap/tree/master/packages/tiptap-commands) | [![](https://img.shields.io/npm/v/tiptap-commands.svg?maxAge=2592000&label=version&colorB=000000)](https://www.npmjs.com/package/tiptap-commands) | [![](https://img.shields.io/npm/dm/tiptap-commands.svg?colorB=000000)](https://npmcharts.com/compare/tiptap-commands?minimal=true) | A collection of commands. These are mostly used for extensions. |
| [`tiptap-utils`](https://github.com/heyscrumpy/tiptap/tree/master/packages/tiptap-utils) | [![](https://img.shields.io/npm/v/tiptap-utils.svg?maxAge=2592000&label=version&colorB=000000)](https://www.npmjs.com/package/tiptap-utils) | [![](https://img.shields.io/npm/dm/tiptap-utils.svg?colorB=000000)](https://npmcharts.com/compare/tiptap-utils?minimal=true) | A collection of utility functions. |

## Examples
To check out some live examples, visit [tiptap.scrumpy.io](https://tiptap.scrumpy.io/).

## Installation
```
npm install tiptap
```

## Basic Setup
```vue
<template>
  <editor>
    <!-- Add HTML to the scoped slot called "content" -->
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
| - | :-: | :-: | - | 
| editable | Boolean | `true` | When set to `false` the editor is read-only. |
| doc | Object | `null` | The editor state object used by Prosemirror. You can also pass HTML to the `content` slot. When used both, the `content` slot will be ignored. |
| extensions | Array | `[]` | A list of extensions used, by the editor. This can be `Nodes`, `Marks` or `Plugins`. |
| @update | Function | `undefined` | This will return the current `state` of Prosemirror on every change. |

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
      ],
    }
  },
}
</script>
```

### Create Custom Extensions 

The most powerful feature of tiptap is that you can create you own extensions. There are 3 basic types of extensions.

| **Type** | **Description** |
| - | - | 
| Extension | The most basic type. It's useful to register some [Prosemirror plugins](https://prosemirror.net/docs/guide/) or some input rules. |
| Node | Add a custom node. Nodes are basically block elements like a headline or a paragraph. |
| Mark | Add a custom mark. Marks are used to add extra styling or other information to inline content like a strong tag or links. |

For a live example you can take a look at the [embed example](https://github.com/heyscrumpy/tiptap/tree/master/examples/Components/Routes/Embeds).

## Contributing

Please see [CONTRIBUTING](CONTRIBUTING.md) for details.

## Credits

- [Philipp Kühn](https://github.com/philippkuehn)
- [All Contributors](../../contributors)

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.
