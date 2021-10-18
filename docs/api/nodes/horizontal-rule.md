---
description: Separate what needs to be separated, but use it wisely.
icon: separator
---

# HorizontalRule
[![Version](https://img.shields.io/npm/v/@tiptap/extension-horizontal-rule.svg?label=version)](https://www.npmjs.com/package/@tiptap/extension-horizontal-rule)
[![Downloads](https://img.shields.io/npm/dm/@tiptap/extension-horizontal-rule.svg)](https://npmcharts.com/compare/@tiptap/extension-horizontal-rule?minimal=true)

Use this extension to render a `<hr>` HTML tag. If you pass `<hr>` in the editor’s initial content, it’ll be rendered accordingly.

Type three dashes (<code>---</code>) or three underscores and a space (<code>___ </code>) at the beginning of a new line and it will magically transform to a horizontal rule.

## Installation
```bash
# with npm
npm install @tiptap/extension-horizontal-rule

# with Yarn
yarn add @tiptap/extension-horizontal-rule
```

## Settings

### HTMLAttributes
Custom HTML attributes that should be added to the rendered HTML tag.

```js
HorizontalRule.configure({
  HTMLAttributes: {
    class: 'my-custom-class',
  },
})
```

## Commands

### setHorizontalRule()
Create a horizontal rule.

```js
editor.commands.setHorizontalRule()
```

## Source code
[packages/extension-horizontal-rule/](https://github.com/ueberdosis/tiptap/blob/main/packages/extension-horizontal-rule/)

## Usage
https://embed.tiptap.dev/preview/Nodes/HorizontalRule
