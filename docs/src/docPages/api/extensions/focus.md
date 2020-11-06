# Focus
The Focus extension adds a CSS class to focused nodes. By default it adds `.has-class`, but you can change that.

Note that it’s only a class, the styling is totally up to you. The usage example below has some CSS for that class.

## Installation
```bash
# with npm
npm install @tiptap/extension-focus

# with Yarn
yarn add @tiptap/extension-focus
```

## Settings
| Option    | Type    | Default   | Description                                            |
| --------- | ------- | --------- | ------------------------------------------------------ |
| className | string  | has-focus | The class that is applied to the focused element.      |
| nested    | boolean | true      | When enabled nested elements get the focus class, too. |

## Source code
[packages/extension-focus/](https://github.com/ueberdosis/tiptap-next/blob/main/packages/extension-focus/)

## Usage
<demo name="Extensions/Focus" highlight="12,34-37" />
