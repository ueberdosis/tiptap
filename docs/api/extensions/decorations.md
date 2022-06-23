---
description: Easy way to add decorations to your editor
icon: markup-line
---

# Decorations
[![Version](https://img.shields.io/npm/v/@tiptap/extension-decorations.svg?label=version)](https://www.npmjs.com/package/@tiptap/extension-decorations)
[![Downloads](https://img.shields.io/npm/dm/@tiptap/extension-decorations.svg)](https://npmcharts.com/compare/@tiptap/extension-decorations?minimal=true)

This extension adds a Prosemirror plugin to your editor allowing your to easily add decorators to specific nodes or characters.

## Installation
```bash
npm install @tiptap/extension-decorations
```

## Settings

### builders
An array of decorator builder classes - by default contains decorations for invisible characters

Default: `[new SpaceDecoration(), new ParagraphDecoration(), new HardBreakDecoration()]`

```js
Decorations.configure({
  builders: [new YourCustomDecoration()]
})
```

## Commands

### showDecorations
Shows the decorations

```js
editor.commands.showDecorations()
```

### hideDecorations
Hides the decorations

```js
editor.commands.hideDecorations()
```


## Source code
[packages/extension-decorations/](https://github.com/ueberdosis/tiptap/blob/main/packages/extension-decorations/)

## Usage
https://embed.tiptap.dev/preview/Extensions/Decorators
