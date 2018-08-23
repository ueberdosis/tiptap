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

## Setup
```vue
<template>
  <editor>
    <!-- Add HTML to the scoped slot called "content" -->
    <div slot="content" slot-scope="props">
      <p>Hello world</p>
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

Soon …
Until then you can take a look at the [embed example](https://github.com/heyscrumpy/tiptap/tree/master/examples/Components/Routes/Embeds).

## Contributing

Please see [CONTRIBUTING](CONTRIBUTING.md) for details.

## Credits

- [Philipp Kühn](https://github.com/philippkuehn)
- [All Contributors](../../contributors)

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.
