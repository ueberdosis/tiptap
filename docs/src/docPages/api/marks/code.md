# Code
The Code extensions enables you to use the `<code>` HTML tag in the editor. If you paste in text with `<code>` tags it will rendered accordingly.

Type something with <code>\`back-ticks around\`</code> and it will magically transform to `inline code` while you type.

## Installation
```bash
# with npm
npm install @tiptap/extension-code

# with Yarn
yarn add @tiptap/extension-code
```

## Settings
| Option         | Type     | Default | Description                                                           |
| -------------- | -------- | ------- | --------------------------------------------------------------------- |
| HTMLAttributes | `Object` | `{}`    | Custom HTML attributes that should be added to the rendered HTML tag. |

## Commands
| Command    | Parameters | Description               |
| ---------- | ---------- | ------------------------- |
| setCode    | —          | Mark text as inline code. |
| toggleCode | —          | Toggle inline code mark.  |
| unsetCode  | —          | Remove inline code mark.  |

## Keyboard shortcuts
* Windows/Linux: `Control`&nbsp;`E`
* macOS: `Cmd`&nbsp;`E`

## Source code
[packages/extension-code/](https://github.com/ueberdosis/tiptap-next/blob/main/packages/extension-code/)

## Usage
<demo name="Marks/Code" highlight="3-5,17,36" />
