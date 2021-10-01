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
| Option         | Type     | Default | Description                                                           |
| -------------- | -------- | ------- | --------------------------------------------------------------------- |
| HTMLAttributes | `Object` | `{}`    | Custom HTML attributes that should be added to the rendered HTML tag. |

## Commands
| Command        | Parameters | Description               |
| -------------- | ---------- | ------------------------- |
| horizontalRule | —          | Create a horizontal rule. |

## Source code
[packages/extension-horizontal-rule/](https://github.com/ueberdosis/tiptap/blob/main/packages/extension-horizontal-rule/)

## Usage
<tiptap-demo name="Nodes/HorizontalRule"></tiptap-demo>
