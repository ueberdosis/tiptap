# Custom extensions

## toc

## Introduction
You can build your own extensions from scratch. Extend the provided `Node`, `Mark`, and `Extension` classes and pass an object with your configuration and custom code.

Read the [overwrite & extend](/guide/extend-extensions) guide to learn more about all the things you can control.

### Create a node
```js
import { Node } from '@tiptap/core'

const CustomNode = Node.create({
  name: 'customNode',

  // Your code goes here.
})
```

### Create a mark
```js
import { Mark } from '@tiptap/core'

const CustomMark = Mark.create({
  name: 'customMark',

  // Your code goes here.
})
```

### Create an extension
```js
import { Extension } from '@tiptap/core'

const CustomExtension = Extension.create({
  name: 'customExtension',

  // Your code goes here.
})
```

## Sharing
When everything is working fine, don’t forget to [share it with the community](https://github.com/ueberdosis/tiptap/issues/819).
