---
description: The gapcursor makes sure the cursor doesn’t get stuck … in a gap.
icon: space
---

# Gapcursor
[![Version](https://img.shields.io/npm/v/@tiptap/extension-gapcursor.svg?label=version)](https://www.npmjs.com/package/@tiptap/extension-gapcursor)
[![Downloads](https://img.shields.io/npm/dm/@tiptap/extension-gapcursor.svg)](https://npmcharts.com/compare/@tiptap/extension-gapcursor?minimal=true)

This extension loads the [ProseMirror Gapcursor plugin](https://github.com/ProseMirror/prosemirror-gapcursor) by Marijn Haverbeke, which adds a gap for the cursor in places that don’t allow regular selection. For example, after a table at the end of a document.

Note that Tiptap is headless, but the gapcursor needs CSS for its appearance. The [default CSS](https://github.com/ueberdosis/tiptap/tree/main/packages/core/src/style.ts) is loaded through the Editor class.

## Installation
```bash
npm install @tiptap/extension-gapcursor
```

:::warning Are you using Yarn, pNPM, npm 6 or less?
Unfortunately your package manager does not install peer dependencies automatically and you have to install them by your own. Please [see here](https://tiptap.dev/installation/peer-dependencies#tiptapextension-gapcursor) which packages are needed and how to install them.
:::

## Source code
[packages/extension-gapcursor/](https://github.com/ueberdosis/tiptap/blob/main/packages/extension-gapcursor/)

## Usage
https://embed.tiptap.dev/preview/Extensions/Gapcursor
