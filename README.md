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

## Contributing

Please see [CONTRIBUTING](CONTRIBUTING.md) for details.

## Credits

- [Philipp Kühn](https://github.com/philippkuehn)
- [All Contributors](../../contributors)

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.
