# Highlight
Use this extension to render highlighted text with `<mark>`. You can use only default `<mark>` HTML tag, which has a yellow background color by default, or apply different colors.

## Installation
```bash
# With npm
npm install @tiptap/extension-highlight

# Or: With Yarn
yarn add @tiptap/extension-highlight
```

## Settings
| Option | Type   | Default | Description                                  |
| ------ | ------ | ------- | -------------------------------------------- |
| class  | string | –       | Add a custom class to the rendered HTML tag. |

## Commands
| Command   | Options | Description               |
| --------- | ------- | ------------------------- |
| highlight | —       | Mark text as highlighted. |

## Keyboard shortcuts
* Windows/Linux: `Control`&nbsp;`E`
* macOS: `Cmd`&nbsp;`E`

## Source code
[packages/extension-highlight/](https://github.com/ueberdosis/tiptap-next/blob/main/packages/extension-highlight/)

## Usage
<demo name="Extensions/Highlight" highlight="3-5,17,36" />
