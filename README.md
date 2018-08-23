# tiptap
A rich-text editor for Vue.js

<p>
	<a href="https://npmcharts.com/compare/tiptap?minimal=true"><img src="https://img.shields.io/npm/dm/tiptap.svg" alt="Downloads"></a>
	<a href="https://www.npmjs.com/package/tiptap"><img src="https://img.shields.io/npm/v/tiptap.svg" alt="Version"></a>
	<a href="https://www.npmjs.com/package/tiptap"><img src="https://img.shields.io/npm/l/tiptap.svg" alt="License"></a>
</p>

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

| Property | Type | Default | Description |
| - | :-: | :-: | - | 
| editable | Boolean | `true` | When set to `false` the editor is read-only. |
| doc | Object | `null` | The editor state object used by Prosemirror. You can also pass HTML to the `content` slot. When used both, the `content` slot will be ignored. |
| extensions | Array | `[]` | A list of extensions used, by the editor. This can be `Nodes`, `Marks` or `Plugins`. |
| @update | Function | `undefined` | This will return the current `state` of Prosemirror on every change. |

## Extensions

By default the editor will only support some boring paragraphs. Other nodes and marks are available as **extensions**. There is a package called `tiptap-extensions` with the most basic nodes, marks and plugins.

#### Available Extensions 

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
// Import the editor
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
        new Heading(),
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

#### Create Custom Extensions 

Soon …
Until then you can take a look at the [embed example](https://github.com/heyscrumpy/tiptap/tree/master/examples/Components/Routes/Embeds).

## Contributing

Please see [CONTRIBUTING](CONTRIBUTING.md) for details.

## Credits

- [Philipp Kühn](https://github.com/philippkuehn)
- [All Contributors](../../contributors)

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.
