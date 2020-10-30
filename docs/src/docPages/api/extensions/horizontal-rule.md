# HorizontalRule
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
| Option | Type   | Default | Description                                  |
| ------ | ------ | ------- | -------------------------------------------- |
| class  | string | –       | Add a custom class to the rendered HTML tag. |

## Commands
| Command         | Options | Description               |
| --------------- | ------- | ------------------------- |
| horizontalRule | —       | Create a horizontal rule. |

## Keyboard shortcuts
*None*

## Source code
[packages/extension-horizontal-rule/](https://github.com/ueberdosis/tiptap-next/blob/main/packages/extension-horizontal-rule/)

## Usage
<demo name="Extensions/HorizontalRule" highlight="3-5,17,36" />
