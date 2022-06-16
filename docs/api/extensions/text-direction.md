---
description: Left, right, center, whatever! Align the text however you like.
icon: align-left
---

# TextDirection

[![Version](https://img.shields.io/npm/v/@tiptap/extension-text-direction.svg?label=version)](https://www.npmjs.com/package/@tiptap/extension-text-direction)
[![Downloads](https://img.shields.io/npm/dm/@tiptap/extension-text-direction.svg)](https://npmcharts.com/compare/@tiptap/extension-text-direction?minimal=true)

This plugin automatically adds the `dir` attribute to a specified list of nodes. The direction is automatically detected based on the node's content.

## Installation

```bash
npm install @tiptap/extension-text-direction
```

## Settings

### types

A list of nodes where the `dir` attribute should be added to. Usually something like `['heading', 'paragraph']`.

Default: `[]`

```js
TextDirection.configure({
  types: ["heading", "paragraph"],
});
```

### directions

A list of available options for the 'dir' attribute.

Default: `['ltr', 'rtl']`

```js
TextDirection.configure({
  directions: ["ltr", "rtl"],
});
```

### defaultDirection

The default direction.

:::warning
If you specify a defaultDirection, the `dir` attribute will be excluded in nodes that have the same direction as the defaultDirection.
:::

Default: `null`

```js
TextDirection.configure({
  defaultDirection: "rtl",
});
```

## Commands

### setTextDirection()

Set the text direction to the specified value.

```js
editor.commands.setTextDirection("rtl");
```

## Source code

[packages/extension-text-direction/](https://github.com/ueberdosis/tiptap/blob/main/packages/extension-text-direction/)

## Usage

https://embed.tiptap.dev/preview/Extensions/TextDirection
