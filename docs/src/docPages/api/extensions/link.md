# Link
Enables you to use the `<a>` HTML tag in the editor.

## Installation
```bash
# With npm
npm install @tiptap/extension-link

# Or: With Yarn
yarn add @tiptap/extension-link
```

## Settings
| Option      | Type    | Default | Description                                  |
| ----------- | ------- | ------- | -------------------------------------------- |
| class       | string  | –       | Add a custom class to the rendered HTML tag. |
| openOnClick | Boolean | true    | Specifies if links will be opened on click.  |

## Commands
| Command | Options | Description             |
| ------- | ------- | ----------------------- |
| link    | —       | Link the selected text. |

## Keyboard shortcuts
* Windows/Linux: `Control` `K`
* macOS: `Cmd` `K`

## Source code
[packages/extension-link/](https://github.com/ueberdosis/tiptap-next/blob/main/packages/extension-link/)

## Usage
<demo name="Extensions/Link" highlight="" />
