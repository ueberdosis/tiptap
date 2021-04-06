# Custom extensions

## toc

## Introduction
You can build your own extensions from scratch with the `Node`, `Mark`, and `Extension` classes. Just pass an object with your configuration and custom code. Read the [ovewrite & extend](/guide/extend-extensions) guide to learn more about all the things you can control.

And if everything is working fine, don’t forget to [share it with the community](https://github.com/ueberdosis/tiptap/issues/819).

### Create a node

```js
import { Node } from '@tiptap/core'

const CustomNode = Node.create({
  // Your code goes here.
})
```

### Create a mark
```js
import { Mark } from '@tiptap/core'

const CustomMark = Mark.create({
  // Your code goes here.
})
```

### Create an extension
```js
import { Extension } from '@tiptap/core'

const CustomExtension = Extension.create({
  // Your code goes here.
})
```
