# Link
[![Version](https://img.shields.io/npm/v/@tiptap/extension-link.svg?label=version)](https://www.npmjs.com/package/@tiptap/extension-link)
[![Downloads](https://img.shields.io/npm/dm/@tiptap/extension-link.svg)](https://npmcharts.com/compare/@tiptap/extension-link?minimal=true)

The Link extension adds support for `<a>` tags to the editor. The extension is headless too, there is no actual UI to add, modify or delete links. The usage example below uses the native JavaScript prompt to show you how that could work.

In a real world application, you would probably add a more sophisticated user interface.

Pasted URLs will be transformed to links automatically.

## Installation
```bash
# with npm
npm install @tiptap/extension-link

# with Yarn
yarn add @tiptap/extension-link
```

## Settings
| Option         | Type      | Default                                                     | Description                                                           |
| -------------- | --------- | ----------------------------------------------------------- | --------------------------------------------------------------------- |
| HTMLAttributes | `Object`  | `{ target: '_blank', rel: 'noopener noreferrer nofollow' }` | Custom HTML attributes that should be added to the rendered HTML tag. |
| openOnClick    | `Boolean` | `true`                                                      | If enabled, links will be opened on click.                            |

## Commands
| Command    | Parameters         | Description                                  |
| ---------- | ------------------ | -------------------------------------------- |
| setLink    | `href`<br>`target` | Link the selected text.                      |
| toggleLink | `href`<br>`target` | Add or remove a link from the selected text. |
| unsetLink  | –                  | Removes a link.                              |

## Keyboard shortcuts
:::warning Doesn’t have a keyboard shortcut
This extension doesn’t bind a specific keyboard shortcut. You would probably open your custom UI on `Mod-k` though.
:::

## Source code
[packages/extension-link/](https://github.com/ueberdosis/tiptap/blob/main/packages/extension-link/)

## Usage
<demo name="Marks/Link" highlight="3-8,19,38,55" />
