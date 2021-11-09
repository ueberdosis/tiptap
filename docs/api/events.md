---
tableOfContents: true
---

# Events

## Introduction
The editor fires a few different events that you can hook into. Let’s have a look at all the available events first:

## List of available events

### beforeCreate
Before the view is created.

### create
The editor is ready.

### update
The content has changed.

### selectionUpdate
The selection has changed.

### transaction
The editor state has changed.

### focus
The editor is focused.

### blur
The editor isn’t focused anymore.

### destroy
The editor is being destroyed.


## Register event listeners
There are three ways to register event listeners.

### Option 1: Configuration
You can define your event listeners on a new editor instance right-away:

```js
const editor = new Editor({
  onBeforeCreate({ editor }) {
    // Before the view is created.
  },
  onCreate({ editor }) {
    // The editor is ready.
  },
  onUpdate({ editor }) {
    // The content has changed.
  },
  onSelectionUpdate({ editor }) {
    // The selection has changed.
  },
  onTransaction({ editor, transaction }) {
    // The editor state has changed.
  },
  onFocus({ editor, event }) {
    // The editor is focused.
  },
  onBlur({ editor, event }) {
    // The editor isn’t focused anymore.
  },
  onDestroy() {
    // The editor is being destroyed.
  },
})
```

### Option 2: Binding
Or you can register your event listeners on a running editor instance:

#### Bind event listeners
```js
editor.on('beforeCreate', ({ editor }) => {
  // Before the view is created.
})

editor.on('create', ({ editor }) => {
  // The editor is ready.
})

editor.on('update', ({ editor }) => {
  // The content has changed.
})

editor.on('selectionUpdate', ({ editor }) => {
  // The selection has changed.
})

editor.on('transaction', ({ editor, transaction }) => {
  // The editor state has changed.
})

editor.on('focus', ({ editor, event }) => {
  // The editor is focused.
})

editor.on('blur', ({ editor, event }) => {
  // The editor isn’t focused anymore.
})

editor.on('destroy', () => {
  // The editor is being destroyed.
})
```

#### Unbind event listeners
If you need to unbind those event listeners at some point, you should register your event listeners with `.on()` and unbind them with `.off()` then.

```js
const onUpdate = () => {
  // The content has changed.
}

// Bind …
editor.on('update', onUpdate)

// … and unbind.
editor.off('update', onUpdate)
```

### Option 3: Extensions
Moving your event listeners to custom extensions (or nodes, or marks) is also possible. Here’s how that would look like:

```js
import { Extension } from '@tiptap/core'

const CustomExtension = Extension.create({
  onBeforeCreate({ editor }) {
    // Before the view is created.
  },
  onCreate({ editor }) {
    // The editor is ready.
  },
  onUpdate({ editor }) {
    // The content has changed.
  },
  onSelectionUpdate({ editor }) {
    // The selection has changed.
  },
  onTransaction({ editor, transaction }) {
    // The editor state has changed.
  },
  onFocus({ editor, event }) {
    // The editor is focused.
  },
  onBlur({ editor, event }) {
    // The editor isn’t focused anymore.
  },
  onDestroy() {
    // The editor is being destroyed.
  },
})
```
