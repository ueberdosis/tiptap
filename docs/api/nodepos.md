# Node Positions

## Introduction

Node Positions (short `NodePos`) are a new concept introduced with Tiptap 3.0.0. They are used to describe a specific position of a node, it's children, it's parent and easy ways to navigate between them. They are heavily inspired by the DOM and are based on Prosemirror's [ResolvedPos](https://prosemirror.net/docs/ref/#model.ResolvedPos) implementation.

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
