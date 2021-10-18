---
description: No text editor without text, so better make sure to install that one.
icon: text
---

# Text
[![Version](https://img.shields.io/npm/v/@tiptap/extension-text.svg?label=version)](https://www.npmjs.com/package/@tiptap/extension-text)
[![Downloads](https://img.shields.io/npm/dm/@tiptap/extension-text.svg)](https://npmcharts.com/compare/@tiptap/extension-text?minimal=true)

**The `Text` extension is required**, at least if you want to work with text of any kind and that’s very likely. This extension is a little bit different, it doesn’t even render HTML. It’s plain text, that’s all.

:::warning Breaking Change from 1.x → 2.x
tiptap 1 tried to hide that node from you, but it has always been there. You have to explicitly import it from now on (or use `StarterKit`).
:::

## Installation
```bash
# with npm
npm install @tiptap/extension-text

# with Yarn
yarn add @tiptap/extension-text
```

## Source code
[packages/extension-text/](https://github.com/ueberdosis/tiptap/blob/main/packages/extension-text/)

## Usage
https://embed.tiptap.dev/preview/Nodes/Text
