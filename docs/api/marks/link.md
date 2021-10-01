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

### HTMLAttributes
Custom HTML attributes that should be added to the rendered HTML tag.

```js
Link.configure({
  HTMLAttributes: {
    class: 'my-custom-class',
  },
})
```

### openOnClick
If enabled, links will be opened on click.

Default: `true`

```js
Link.configure({
  openOnClick: false,
})
```

### linkOnPaste
Adds a link to the current selection if the pasted content only contains an url.

Default: `true`

```js
Link.configure({
  linkOnPaste: false,
})
```


## Commands

### setLink()
Links the selected text.

```js
editor.commands.setLink({ href: 'https://example.com' })
editor.commands.setLink({ href: 'https://example.com', target: '_blank' })
```

### toggleLink()
Adds or removes a link from the selected text.

```js
editor.commands.toggleLink({ href: 'https://example.com' })
editor.commands.toggleLink({ href: 'https://example.com', target: '_blank' })
```

### unsetLink()
Removes a link.

```js
editor.commands.unsetLink()
```

## Keyboard shortcuts
:::warning Doesn’t have a keyboard shortcut
This extension doesn’t bind a specific keyboard shortcut. You would probably open your custom UI on `Mod-k` though.
:::

## Get the current value
Did you know that you can use [`getAttributes`](/api/editor#get-attributes) to find out which attributes, for example which href, is currently set? Don’t confuse it with a [command](/api/commands) (which changes the state), it’s just a method. Here is how that could look like:

```js
this.editor.getAttributes('link').href
```

## Source code
[packages/extension-link/](https://github.com/ueberdosis/tiptap/blob/main/packages/extension-link/)

## Usage
<tiptap-demo name="Marks/Link"></tiptap-demo>
