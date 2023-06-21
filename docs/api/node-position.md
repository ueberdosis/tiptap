---
tableOfContents: true
---

# Node Position

## Introduction

Working with ProseMirror can become a bit tricky when it comes to finding nodes and their positions as ProseMirror completely builds around `ResolvedPos` to find out information about a specific position, it's node, etc. This is why we implemented the `NodePosition` class.

This class can help you find a node, it's position, it's parents and children and even has helper functions to find parents up in the tree or children down in the tree.

## Usage

```js
import { NodePosition } from '@tiptap/core'

// NodePositions always require a ResolvedPos as input
const { $anchor } = editor.state.selection
const nodePosition = new NodePosition($anchor)
```

## API

### Attributes & Getters

#### `NodePosition.node`

The node at the current position.

```js
nodePosition.node
```

#### `NodePosition.$pos`

The ResolvedPos at the current position.

```js
nodePosition.$pos
```

#### `NodePosition.doc`

The current document of the NodePosition

```js
nodePosition.doc
```

#### `NodePosition.depth`

The depth of the current position.

```js
nodePosition.depth
```

#### `NodePosition.name`

The node's name at the current NodePosition.

```js
nodePosition.name
```

#### `NodePosition.from`

The start position of the current NodePosition.

```js
nodePosition.from
```

#### `NodePosition.to`

The end position of the current NodePosition.

```js
nodePosition.to
```

#### `NodePosition.before`

Get the NodePosition before this NodePosition

```js
nodePosition.before

// this can also be chained
nodePosition.before.before
```

#### `NodePosition.after`

Get the NodePosition after this NodePosition

```js
nodePosition.after

// this can also be chained
nodePosition.after.after
```

#### `NodePosition.parent`

Get the parent NodePosition of this NodePosition. If there is no parent, it will return null.

```js
nodePosition.parent

// this can also be chained
nodePosition.parent.parent
```

#### `NodePosition.text`

Gets the text inside of NodePosition where textNodes are available and have content.

```js
nodePosition.text
```

#### `NodePosition.textContent`

Gets the text inside of NodePosition.

```js
nodePosition.textContent
```

#### `NodePosition.children`

Returns an array of NodePositions of all direct children of this NodePosition.

```js
nodePosition.children
```

#### `NodePosition.firstChild`

Returns the first child's NodePosition of this NodePosition.

```js
nodePosition.firstChild
```

#### `NodePosition.lastChild`

Returns the last child's NodePosition of this NodePosition.

```js
nodePosition.lastChild
```

#### `NodePosition.range`

Returns a range object of the current NodePosition.

```js
const { from, to } = nodePosition.range
```

### Methods

#### `NodePosition.getChildrenOnDepth`

This method returns all children of a node on a specific depth as new NodePositions.

```js
nodePosition.getChildrenOnDepth(nodePosition + 1)
```

#### `NodePosition.getDeepChildren()`

This method returns all children on any depth as new NodePositions.

```js
nodePosition.getDeepChildren()
```

#### `NodePosition.getParentByType`

This method will return the closest parent of a given type. The type can be a string or an array of strings.

```js
// either look up a single type
nodePosition.getParentByType('bulletList')

// or look up multiple types
nodePosition.getParentByType(['bulletList', 'orderedList'])
```

#### `NodePosition.hasParentByType``

This method will return true or false if a parent of a given type exists. The type can be a string or an array of strings.

```js
// either look up a single type
nodePosition.hasParentByType('bulletList')

// or look up multiple types
nodePosition.hasParentByType(['bulletList', 'orderedList'])
```

#### `NodePosition.createNodeRange`

Creates a node range for the given NodePosition. Returns a ProseMirror `NodeRange` object.

```js
const nodeRange = nodePosition.createNodeRange()
```

## Examples

### Receiving information about a following node of a parent list

```js
// make sure to import the NodePosition class
import { NodePosition } from '@tiptap/core'

// first lets get the current selection position
// as a ResolvedPos
const { $anchor } = editor.state.selection

// Now lets create a NodePosition out of it
const nodePosition = new NodePosition(nodePosition)

// Lets find the closest parent list
const parentList = nodePosition.getParentByType(['bulletList', 'orderedList'])

if (!parentList) {
  return null
}

// Lets find the next node after the parent list
const nextNode = parentList.after
```
