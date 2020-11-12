# TextStyle
This mark renders a `<span>` HTML tag and enables you to add a list of styling related attributes, for example font-family, font-size, or font-color. The extension doesn’t add any styling attribute by default, but other extensions use it as the foundation, for example [`FontFamily`](/api/extensions/font-family).

## Installation
```bash
# with npm
npm install @tiptap/extension-text-style

# with Yarn
yarn add @tiptap/extension-text-style
```

## Commands
| Command              | Parameters | Description                                   |
| -------------------- | ---------- | --------------------------------------------- |
| removeEmptyTextStyle | –          | Remove `<span>` tags without an inline style. |

## Source code
[packages/extension-text-style/](https://github.com/ueberdosis/tiptap-next/blob/main/packages/extension-text-style/)

## Usage
<demo name="Marks/TextStyle" />
