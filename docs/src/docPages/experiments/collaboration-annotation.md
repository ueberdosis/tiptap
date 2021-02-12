# CollaborationAnnotation
[![Version](https://img.shields.io/npm/v/@tiptap/extension-collaboration-annotation.svg?label=version)](https://www.npmjs.com/package/@tiptap/extension-collaboration-annotation)
[![Downloads](https://img.shields.io/npm/dm/@tiptap/extension-collaboration-annotation.svg)](https://npmcharts.com/compare/@tiptap/extension-collaboration-annotation?minimal=true)

⚠️ Experiment

Annotations can be used to add additional information to the content, for example comments. They live on a different level than the actual editor content.

<!-- :::pro Pro Extension
We kindly ask you to [sponsor our work](/sponsor) when using this extension in production.
::: -->

## Installation
```bash
# with npm
npm install @tiptap/extension-collaboration-annotation

# with Yarn
yarn add @tiptap/extension-collaboration-annotation
```

This extension requires the [`Collaboration`](/api/extensions/collaboration) extension.

## Settings
| Option   | Type     | Default     | Description                                                                        |
| -------- | -------- | ----------- | ---------------------------------------------------------------------------------- |
| document | `Object` | `null`      | An initialized Y.js document.                                                      |
| field    | `String` | `'default'` | Name of a Y.js map, can be changed to sync multiple fields with one Y.js document. |
| map      | `Object` | `null`      | A raw Y.js map, can be used instead of `document` and `field`.                     |

## Commands
| Command          | Parameters | Description                                                               |
| ---------------- | ---------- | ------------------------------------------------------------------------- |
| addAnnotation    | data       | Adds an annotation to the current selection, takes a string or an object. |
| updateAnnotation | id, data   | Update the data that’s associated with an annotation.                     |
| deleteAnnotation | id         | Remove an annotation.                                                     |

## Source code
[packages/extension-collaboration-annotation/](https://github.com/ueberdosis/tiptap-next/blob/main/packages/extension-collaboration-annotation/)

## Usage
<demo name="Experiments/CollaborationAnnotation" />
