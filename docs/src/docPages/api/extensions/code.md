# Code
The Code extensions enables you to use the `<code>` HTML tag in the editor. If you paste in text with `<code>` tags it will rendered accordingly.

Type something with <code>\`back-ticks around\`</code> and it will magically transform to `inline code` while you type.

## Installation
```bash
# With npm
npm install @tiptap/extension-code

# Or: With Yarn
yarn add @tiptap/extension-code
```

## Options
| Option | Type   | Default | Description                                  |
| ------ | ------ | ------- | -------------------------------------------- |
| class  | string | –       | Add a custom class to the rendered HTML tag. |

## Commands
| Command | Options | Description               |
| ------- | ------- | ------------------------- |
| code    | —       | Mark text as inline code. |

## Keyboard shortcuts
* `Alt` + `

## Source code
[packages/extension-code/](https://github.com/ueberdosis/tiptap-next/blob/main/packages/extension-code/)

## Usage
<demo name="Extensions/Code" highlight="3-5,17,36" />