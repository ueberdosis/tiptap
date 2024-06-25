---
description: Link it, link it good, link it real good (and don’t forget the href).
icon: link
---

# Link
[![Version](https://img.shields.io/npm/v/@tiptap/extension-link.svg?label=version)](https://www.npmjs.com/package/@tiptap/extension-link)
[![Downloads](https://img.shields.io/npm/dm/@tiptap/extension-link.svg)](https://npmcharts.com/compare/@tiptap/extension-link?minimal=true)

The Link extension adds support for `<a>` tags to the editor. The extension is headless too, there is no actual UI to add, modify or delete links. The usage example below uses the native JavaScript prompt to show you how that could work.

In a real world application, you would probably add a more sophisticated user interface.

Pasted URLs will be transformed to links automatically.

## Installation
```bash
npm install @tiptap/extension-link
```

## Settings

### protocols
Additional custom protocols you would like to be recognized as links.

Default: `[]`

```js
Link.configure({
  protocols: ['ftp', 'mailto'],
})
```

By default, [linkify](https://linkify.js.org/docs/) adds `//` to the end of a protocol however this behavior can be changed by passing `optionalSlashes` option
```js
Link.configure({
  protocols: [
    {
      scheme: 'tel',
      optionalSlashes: true
    }
  ]
})
```

### autolink
If enabled, it adds links as you type.

Default: `true`

```js
Link.configure({
  autolink: false,
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


### default protocol
The default protocol used by `linkOnPaste` and `autolink` when no protocol is defined.

By default, the href generated for example.com is http://example.com and this option allows that protocol to be customized.

Default: `http`

```js
Link.configure({
  defaultProtocol: 'https',
})
```

### HTMLAttributes
Custom HTML attributes that should be added to the rendered HTML tag.

```js
Link.configure({
  HTMLAttributes: {
    class: 'my-custom-class',
  },
})
```

#### Removing and overriding existing html attributes

You can add `rel: null` to HTMLAttributes to remove the default `rel="noopener noreferrer nofollow"`. You can also override the default by using `rel: "your-value"`.

This can also be used to change the `target` from the default value of `_blank`.

```js
Link.configure({
  HTMLAttributes: {
    // Change rel to different value
    // Allow search engines to follow links(remove nofollow)
    rel: 'noopener noreferrer',
    // Remove target entirely so links open in current tab
    target: null,
  },
})
```

### validate
A function that validates every autolinked link. If it exists, it will be called with the link href as argument. If it returns `false`, the link will be removed.

Can be used to set rules for example excluding or including certain domains, tlds, etc.

```js
// only autolink urls with a protocol
Link.configure({
  validate: href => /^https?:\/\//.test(href),
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
https://embed.tiptap.dev/preview/Marks/Link
