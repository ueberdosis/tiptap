# BulletList
[![Version](https://img.shields.io/npm/v/@tiptap/extension-bullet-list.svg?label=version)](https://www.npmjs.com/package/@tiptap/extension-bullet-list)
[![Downloads](https://img.shields.io/npm/dm/@tiptap/extension-bullet-list.svg)](https://npmcharts.com/compare/@tiptap/extension-bullet-list?minimal=true)

This extension enables you to use bullet lists in the editor. They are rendered as `<ul>` HTML tags.

Type <code>*&nbsp;</code>, <code>-&nbsp;</code> or <code>+&nbsp;</code> at the beginning of a new line and it will magically transform to a bullet list.

## Installation
```bash
# with npm
npm install @tiptap/extension-bullet-list @tiptap/extension-list-item

# with Yarn
yarn add @tiptap/extension-bullet-list @tiptap/extension-list-item
```

This extension requires the [`ListItem`](/api/nodes/list-item) node.

## Settings
| Option         | Type     | Default | Description                                                           |
| -------------- | -------- | ------- | --------------------------------------------------------------------- |
| HTMLAttributes | `Object` | `{}`    | Custom HTML attributes that should be added to the rendered HTML tag. |

## Commands
| Command    | Parameters | Description           |
| ---------- | ---------- | --------------------- |
| bulletList | —          | Toggle a bullet list. |

## Keyboard shortcuts
| Command          | Windows/Linux                   | macOS                       |
| ---------------- | ------------------------------- | --------------------------- |
| toggleBulletList | `Control`&nbsp;`Shift`&nbsp;`8` | `Cmd`&nbsp;`Shift`&nbsp;`8` |

## Source code
[packages/extension-bullet-list/](https://github.com/ueberdosis/tiptap/blob/main/packages/extension-bullet-list/)

## Usage
<tiptap-demo name="Nodes/BulletList"></tiptap-demo>
