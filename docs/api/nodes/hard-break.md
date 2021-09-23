# HardBreak
[![Version](https://img.shields.io/npm/v/@tiptap/extension-hard-break.svg?label=version)](https://www.npmjs.com/package/@tiptap/extension-hard-break)
[![Downloads](https://img.shields.io/npm/dm/@tiptap/extension-hard-break.svg)](https://npmcharts.com/compare/@tiptap/extension-hard-break?minimal=true)

The HardBreak extensions adds support for the `<br>` HTML tag, which forces a line break.

## Installation
```bash
# with npm
npm install @tiptap/extension-hard-break

# with Yarn
yarn add @tiptap/extension-hard-break
```

## Settings
| Option         | Type      | Default | Description                                                                                    |
| -------------- | --------- | ------- | ---------------------------------------------------------------------------------------------- |
| HTMLAttributes | `Object`  | `{}`    | Custom HTML attributes that should be added to the rendered HTML tag.                          |
| keepMarks      | `Boolean` | `true`  | Decides whether to keep marks after a line break. Based on the `keepOnSplit` option for marks. |

## Commands
| Command      | Parameters | Description       |
| ------------ | ---------- | ----------------- |
| setHardBreak | —          | Add a line break. |

## Keyboard shortcuts
* `Shift`&nbsp;`Enter`
* Windows/Linux: `Control`&nbsp;`Enter`
* macOS: `Cmd`&nbsp;`Enter`

## Source code
[packages/extension-hard-break/](https://github.com/ueberdosis/tiptap/blob/main/packages/extension-hard-break/)

## Usage
<tiptap-demo name="Nodes/HardBreak"></tiptap-demo>
