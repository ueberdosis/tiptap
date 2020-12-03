# Create a toolbar

## toc

## Introduction
tiptap comes very raw, but that’s a good thing. You have full control (and when we say full, we mean full) about the appearance of it. That also means you have to build the editor toolbar on your own. Don’t worry though, you can start with a few buttons and we help you with everything else.

## Commands
Let’s assume you’ve got the editor running already and you want to add your first button. You’ll need a `<button>` HTML tag, and add a click handler. Depending on your setup, that can look like the following Vue.js example:

```html
<button @click="editor.chain().toggleBold().focus().run()">
  Bold
</button>
```

Oh, that’s a long command, right? Actually, it’s a [chain of commands](/api/commands#chain-commands), so let’s go through this one by one:

```js
editor.chain().toggleBold().focus().run()
```

1. `editor` should be a tiptap instance,
2. `chain()` is used to tell the editor you want to execute multiple commands,
3. `toggleBold()` marks selected text bold, or removes the bold mark from the text selection if it’s already applied,
4. `focus()` sets the focus back to the editor and
5. `run()` will execute the chain.

In other words: This will be the typical **Bold** button for your text editor.

Which commands are available depends on what extensions you’ve registered with editor. Most of the extensions come with a `set…()`, `unset…()` and `toggle…()` command. Read the extension documentation to see what’s actually available or just surf through your code editor’s autocomplete.

## Keep the focus
You’ve seen the `focus()` command in the above example already. When you click on the button, the browser focuses that DOM element and the editor loses focus. It’s likely you want to add `focus()` to all your toolbar buttons, so the writing flow of your users isn’t interrupted.

## The active state
The editor provides an `isActive()` method to check if something is applied to the selected text already. In Vue.js you can toggle a CSS class with help of that function like that:

```html
<button :class="{ 'is-active': editor.isActive('bold') }" @click="editor.chain().toggleBold().focus().run()">
  Bold
</button>
```

This toggles the `.is-active` class accordingly. This works for nodes, and marks. You can even check for specific attributes, here is an example with the [`Highlight`](/api/marks/highlight) mark, that ignores different attributes:

```js
editor.isActive('highlight')
```

And an example that compares the given attribute(s):

```js
editor.isActive('highlight', { color: '#ffa8a8' })
```

You can even ignore nodes and marks, but check for the attributes only. Here is an example with the [`TextAlign`](/api/extensions/text-align) extension:

```js
editor.isActive({ textAlign: 'right' })
```

If your selection spans multiple nodes or marks, or only part of the selection has a mark, `isActive()` will return `false` and indicate nothing is active. That is how it is supposed to be, because it allows people to apply a new node or mark to that selection right-away.

## Icons
Most editor toolbars use icons for their buttons. In some of our demos, we use the open source icon set [Remix Icon](https://remixicon.com/), that’s free to use. But it’s totally up to you what you use. Here are a few icon sets you can consider:

* [Remix Icon](https://remixicon.com/#editor)
* [Font Awesome](https://fontawesome.com/icons?c=editors)
* [UI icons](https://www.ibm.com/design/language/iconography/ui-icons/library/)

Also, we’re working on providing a configurable interface for tiptap. If you think that’s a great idea, [become a sponsor](/sponsor) to show us your support. 💖
