# Build extensions

## toc

## Introduction
You can build your own extensions from scratch with the `Node`, `Mark`, and `Extension` classes. Pass an option with your code and configuration.

And if everything is working fine, don’t forget to [share it with the community](https://github.com/ueberdosis/tiptap-next/issues/new/choose).

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
