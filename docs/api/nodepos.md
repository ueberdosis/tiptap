---
tableOfContents: true
---

# Node Positions

## Introduction

Node Positions (short `NodePos`) are a new concept introduced with Tiptap 2.2.0. They are used to describe a specific position of a node, it's children, it's parent and easy ways to navigate between them. They are heavily inspired by the DOM and are based on Prosemirror's [ResolvedPos](https://prosemirror.net/docs/ref/#model.ResolvedPos) implementation.

## Usage

The easiest way to create a new **Node Position** is to use the helper functions added to the Editor instance. This way you always use the correct editor instance and have direct access to the API.

```js
// set up your editor somewhere up here

// The NodePosition for the outermost document node
const $doc = editor.$doc

// This will get all nodes with the type 'heading' currently found in the document
const $headings = editor.$nodes('heading')

// You can also combine this to filter by attributes
const $h1 = editor.$nodes('heading', { level: 1 })

// You can also pick nodes directly:
const $firstHeading = editor.$node('heading', { level: 1 })

// If you don't know the type but the position you want to work with, you can create a new NodePos via the $pos method
const $myCustomPos = editor.$pos(30)
```

You can also create your own NodePos instances:

```js
// You need to have an editor instance
// and a position you want to map to
const myNodePos = new NodePos(100, editor)
```

## What can I do with a NodePos?

NodePos can be used to traverse the document similar to the document DOM of your browser. You can access the parent node, child nodes and the sibling nodes. Here are an example of what you can do with a `codeBlock` node:

```js
// get the first codeBlock from your document
const $codeBlock = editor.$node('codeBlock')

// get the previous NodePos of your codeBlock node
const $previousItem = $codeBlock.before

// easily update the content
$previousItem.content = '<p>Updated content</p>'
```

If you are familiar with the DOM the following example should look familiar to you:

```js
// get a bullet list from your doc
const $bulletList = editor.$node('bulletList')

// get all listItems from your bulletList
const $listItems = $bulletList.querySelectorAll('listItem')

// get the last listItem
const $lastListItem = $listItems[0]

// insert a new listItem after the last one
editor.commands.insertContentAt($lastListItem.after, '<li>New item</li>')
```

## API

### NodePos

The NodePos class is the main class you will work with. It is used to describe a specific position of a node, it's children, it's parent and easy ways to navigate between them. They are heavily inspired by the DOM and are based on Prosemirror's [ResolvedPos](https://prosemirror.net/docs/ref/#model.ResolvedPos) implementation.

#### Methods

##### constructor

**Arguments**
- `pos` – The position you want to map to
- `editor` – The editor instance you want to use

**Returns** `NodePos`

```js
const myNodePos = new NodePos(100, editor)
```

##### closest

The closest NodePos instance of your NodePosition going up the depth. If there is no matching NodePos, it will return `null`.

**Returns** `NodePos | null`

```js
const closest = myNodePos.closest('bulletList')
```

##### querySelector

The first matching NodePos instance of your NodePosition going down the depth. If there is no matching NodePos, it will return `null`.

You can also filter by attributes via the second attribute.

**Returns** `NodePos | null`

```js
const firstHeading = myNodePos.querySelector('heading')
const firstH1 = myNodePos.querySelector('heading', { level: 1 })
```

##### querySelectorAll

All matching NodePos instances of your NodePosition going down the depth. If there is no matching NodePos, it will return an empty array.

You can also filter by attributes via the second attribute.

**Returns** `Array<NodePos>`

```js
const headings = myNodePos.querySelectorAll('heading')
const h1s = myNodePos.querySelectorAll('heading', { level: 1 })
```

##### setAttributes

Set attributes on the current NodePos.

**Returns** `NodePos`

```js
myNodePos.setAttributes({ level: 1 })
```

#### Properties

##### node

The Prosemirror Node at the current Node Position.

**Returns** `Node`

```js
const node = myNodePos.node
node.type.name // 'paragraph'
```

##### element

The DOM element at the current Node Position.

**Returns** `Element`

```js
const element = myNodePos.element
element.tagName // 'P'
```

##### content

The content of your NodePosition. This can be set to a new value to update the content of the node.

**Returns** `string`

```js
const content = myNodePos.content
myNodePos.content = '<p>Updated content</p>'
```

##### attributes

The attributes of your NodePosition.

**Returns** `Object`

```js
const attributes = myNodePos.attributes
attributes.level // 1
```

##### textContent

The text content of your NodePosition.

**Returns** `string`

```js
const textContent = myNodePos.textContent
```

##### depth

The depth of your NodePosition.

**Returns** `number`

```js
const depth = myNodePos.depth
```

##### pos

The position of your NodePosition.

**Returns** `number`

```js
const pos = myNodePos.pos
```

##### size

The size of your NodePosition.

**Returns** `number`

```js
const size = myNodePos.size
```

##### from

The from position of your NodePosition.

**Returns** `number`

```js
const from = myNodePos.from
```

##### to

The to position of your NodePosition.

**Returns** `number`

```js
const to = myNodePos.to
```

##### range

The range of your NodePosition.

**Returns** `number`

```js
const range = myNodePos.range
```

##### parent

The parent NodePos of your NodePosition.

**Returns** `NodePos`

```js
const parent = myNodePos.parent
```

##### before

The NodePos before your NodePosition. If there is no NodePos before, it will return `null`.

**Returns** `NodePos | null`

```js
const before = myNodePos.before
```

##### after

The NodePos after your NodePosition. If there is no NodePos after, it will return `null`.

**Returns** `NodePos | null`

```js
const after = myNodePos.after
```

##### children

The child NodePos instances of your NodePosition.

**Returns** `Array<NodePos>`

```js
const children = myNodePos.children
```

##### firstChild

The first child NodePos instance of your NodePosition. If there is no child, it will return `null`.

**Returns** `NodePos | null`

```js
const firstChild = myNodePos.firstChild
```

##### lastChild

The last child NodePos instance of your NodePosition. If there is no child, it will return `null`.

**Returns** `NodePos | null`

```js
const lastChild = myNodePos.lastChild
```
