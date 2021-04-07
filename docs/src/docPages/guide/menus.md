# Create menus

## toc

## Introduction
tiptap comes very raw, but that’s a good thing. You have full control (and when we say full, we mean full) about the appearance of it. That also means you can (and have to) build a menu on your own. You can start with a few buttons, and we help you to wire everything up.

## Menus
The editor provides a fluent API to trigger commands and add active states. You can use any markup you like. To make the positioning of line menus easier, we provide a few utilities and components. Let’s go through the most typical use cases one by one.

### Fixed menu
A fixed menu, for example on top of the editor, can be anything. We don’t provide such menu. Just add a `<div>` with a few `<button>`s. How those buttons can trigger [commands](/api/commands) is [explained below](#actions).

### Bubble menu
The [bubble menu](/api/extensions/bubble-menu) appears when selecting text. Markup and styling is totally up to you.

<demos
  :items="{
    Vue: 'Extensions/BubbleMenu/Vue',
    React: 'Extensions/BubbleMenu/React',
  }"
  hide-source
/>

It’ll get an absolute position near the text selection. Make sure to add `position: relative` to the wrapper.

### Floating menu
The [floating menu](/api/extensions/floating-menu) appears in empty lines. Markup and styling is totally up to you.

<demos
  :items="{
    Vue: 'Extensions/FloatingMenu/Vue',
    React: 'Extensions/FloatingMenu/React',
  }"
  hide-source
/>

## Buttons
Okay, you’ve got your menu. But how do you wire things up?
### Commands
Let’s assume you’ve got the editor running already and you want to add your first button. You’ll need a `<button>` HTML tag with a click handler. Depending on your setup, that can look like the following example:

```html
<button onclick="editor.chain().toggleBold().focus().run()">
  Bold
</button>
```

Oh, that’s a long command, right? Actually, it’s a [chain of commands](/api/commands#chain-commands), so let’s go through this one by one:

```js
editor.chain().focus().toggleBold().run()
```

1. `editor` should be a tiptap instance,
2. `chain()` is used to tell the editor you want to execute multiple commands,
3. `focus()` sets the focus back to the editor,
4. `toggleBold()` marks the selected text bold, or removes the bold mark from the text selection if it’s already applied and
5. `run()` will execute the chain.

In other words: This will be a typical **Bold** button for your text editor.

Which commands are available depends on what extensions you have registered with the editor. Most extensions come with a `set…()`, `unset…()` and `toggle…()` command. Read the extension documentation to see what’s actually available or just surf through your code editor’s autocomplete.

### Keep the focus
You have seen the `focus()` command in the above example already. When you click on the button, the browser focuses that DOM element and the editor loses focus. It’s likely you want to add `focus()` to all your menu buttons, so the writing flow of your users isn’t interrupted.

### The active state
The editor provides an `isActive()` method to check if something is applied to the selected text already. In Vue.js you can toggle a CSS class with help of that function like that:

```html
<button :class="{ 'is-active': editor.isActive('bold') }" @click="editor.chain().toggleBold().focus().run()">
  Bold
</button>
```

This toggles the `.is-active` class accordingly and works for nodes and marks. You can even check for specific attributes, here is an example with the [`Highlight`](/api/marks/highlight) mark, that ignores different attributes:

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

If your selection spans multiple nodes or marks, or only part of the selection has a mark, `isActive()` will return `false` and indicate nothing is active. This is how it is supposed to be, because it allows people to apply a new node or mark to that selection right-away.

## User experience
When designing a great user experience you should consider a few things.

### Accessibility
* Make sure users can navigate the menu with their keyboard
* Use proper [title attributes](https://developer.mozilla.org/de/docs/Web/HTML/Global_attributes/title)
* Use proper [aria attributes](https://developer.mozilla.org/en-US/docs/Learn/Accessibility/WAI-ARIA_basics)
* List available keyboard shortcuts

:::warning Incomplete
This section needs some work. Do you know what else needs to be taken into account when building an editor menu? Let us know on [GitHub](https://github.com/ueberdosis/tiptap-next) or send us an email to [humans@tiptap.dev](mailto:humans@tiptap.dev)!
:::

### Icons
Most editor menus use icons for their buttons. In some of our demos, we use the open-source icon set [Remix Icon](https://remixicon.com/), that’s free to use. But it’s totally up to you what you use. Here are a few icon sets you can consider:

* [Remix Icon](https://remixicon.com/#editor)
* [Font Awesome](https://fontawesome.com/icons?c=editors)
* [UI icons](https://www.ibm.com/design/language/iconography/ui-icons/library/)
