# Events

## toc

## Introduction
The editor fires a few different events that you can hook into. There are three ways to register event listeners:

## Option 1: Configuration
You can define your event listeners on a new editor instance right-away:

```js
const editor = new Editor({
  onCreate() {
    // The editor is ready.
  },
  onUpdate() {
    // The content has changed.
  },
  onSelection() {
    // The selection has changed.
  },
  onTransaction({ transaction }) {
    // The editor state has changed.
  },
  onFocus({ event }) {
    // The editor is focused.
  },
  onBlur({ event }) {
    // The editor isn’t focused anymore.
  },
  onDestroy() {
    // The editor is being destroyed.
  },
})
```

## Option 2: Binding
Or you can register your event listeners on a running editor instance:

### Bind event listeners
```js
editor.on('create', () => {
  // The editor is ready.
}

editor.on('update', () => {
  // The content has changed.
}

editor.on('selectionUpdate', () => {
  // The selection has changed.
}

editor.on('viewUpdate', () => {
  // The view has changed.
}

editor.on('transaction', ({ transaction }) => {
  // The editor state has changed.
}

editor.on('focus', ({ event }) => {
  // The editor is focused.
}

editor.on('blur', ({ event }) => {
  // The editor isn’t focused anymore.
}

editor.on('destroy', () => {
  // The editor is being destroyed.
}
```

### Unbind event listeners
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

## Option 3: Extensions
Moving your event listeners to custom extensions (or nodes, or marks) is also possible. Here’s how that would look like:

```js
import { Extension } from '@tiptap/core'

const CustomExtension = Extension.create({
  onCreate() {
    // The editor is ready.
  },
  onUpdate() {
    // The content has changed.
  },
  onSelection() {
    // The selection has changed.
  },
  onTransaction({ transaction }) {
    // The editor state has changed.
  },
  onFocus({ event }) {
    // The editor is focused.
  },
  onBlur({ event }) {
    // The editor isn’t focused anymore.
  },
  onDestroy() {
    // The editor is being destroyed.
  },
})
```
