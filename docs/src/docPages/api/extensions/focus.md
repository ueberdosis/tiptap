# Focus
[![Version](https://img.shields.io/npm/v/@tiptap/extension-focus.svg?label=version)](https://www.npmjs.com/package/@tiptap/extension-focus)
[![Downloads](https://img.shields.io/npm/dm/@tiptap/extension-focus.svg)](https://npmcharts.com/compare/@tiptap/extension-focus?minimal=true)

The Focus extension adds a CSS class to focused nodes. By default it adds `.has-focus`, but you can change that.

Note that it’s only a class, the styling is totally up to you. The usage example below has some CSS for that class.

## Installation
```bash
# with npm
npm install @tiptap/extension-focus

# with Yarn
yarn add @tiptap/extension-focus
```

## Settings
| Option    | Type     | Default       | Description                                                                  |
| --------- | -------- | ------------- | ---------------------------------------------------------------------------- |
| className | `String` | `'has-focus'` | The class that is applied to the focused element.                            |
| mode      | `String` | `'all'`       | Apply the class to `'all'`, the `'shallowest'` or the `'deepest'` node. |

## Source code
[packages/extension-focus/](https://github.com/ueberdosis/tiptap/blob/main/packages/extension-focus/)

## Usage
<tiptap-demo name="Extensions/Focus"></tiptap-demo>
