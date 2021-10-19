---
tableOfContents: true
---

# Upgrade Guide

## Introduction
First of all, Tiptap v1 isn’t supported anymore and won’t receive any further updates.

Yes, it’s tedious work to upgrade your favorite text editor to a new API, but we made sure you’ve got enough reasons to upgrade to the newest version.

* Autocompletion in your IDE (thanks to TypeScript)
* Amazing documentation with 100+ pages and 100+ interactive examples
* Active development, new features in the making, new releases every week
* Tons of new extensions
* Well-tested code base

The new API will look pretty familiar to you, but there are a ton of changes though. To make the upgrade a little bit easier, here is everything you need to know:

## Uninstall Tiptap v1
The whole package structure has changed, we even moved to another npm namespace, so you’ll need to remove the old version entirely before upgrading to Tiptap 2.

Otherwise you’ll run into an exception, for example “looks like multiple versions of prosemirror-model were loaded”.

```bash
# with npm
npm uninstall Tiptap Tiptap-commands Tiptap-extensions Tiptap-utils

# with Yarn
yarn remove Tiptap Tiptap-commands Tiptap-extensions Tiptap-utils
```

## Install Tiptap v2

Once you have uninstalled the old version of Tiptap, install the new Vue 2 package and the starter kit:

```bash
# install with npm
npm install @tiptap/vue-2 @tiptap/starter-kit

# install with Yarn
yarn add @tiptap/vue-2 @tiptap/starter-kit
```

## Keep Tiptap v2 up to date
We are constantly releasing updates to Tiptap. Did you know there’s an easy-to-use command to update your dependencies with Yarn?

```bash
yarn upgrade-interactive
```

You can add the `--latest` flag, to show all possible upgrades – even if they don’t follow the versioning you’ve set in your package.json.

```bash
yarn upgrade-interactive --latest
```

## Explicitly register the Document, Text and Paragraph extensions
tiptap 1 tried to hide a few required extensions from you with the default setting `useBuiltInExtensions: true`. That setting has been removed and you’re required to import all extensions. Be sure to explicitly import at least the [`Document`](/api/nodes/document), [`Paragraph`](/api/nodes/paragraph) and [`Text`](/api/nodes/text) extensions.

```js
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'

new Editor({
  extensions: [
    Document,
    Paragraph,
    Text,
    // all your other extensions
  ],
})
```

And we removed some settings: `dropCursor`, `enableDropCursor`, and `enableGapCursor`. Those are separate extensions now: [`Dropcursor`](/api/extensions/dropcursor) and [`Gapcursor`](/api/extensions/gapcursor). You probably want to load them, but if you don’t, just ignore this.

## New names for most extensions
We switched to lowerCamelCase, so there’s a lot type names that changed. If you stored your content as JSON you need to loop through it and rename them. Sorry for that one.

| Old type              | New type               |
| --------------------- | ---------------------- |
| ~~`bullet_list`~~     | `bulletList`           |
| ~~`code_block`~~      | `codeBlock`            |
| ~~`hard_break`~~      | `hardBreak`            |
| ~~`horizontal_rule`~~ | `horizontalRule`       |
| ~~`list_item`~~       | `listItem`             |
| ~~`ordered_list`~~    | `orderedList`          |
| ~~`table_cell`~~      | `tableCell`            |
| ~~`table_header`~~    | `tableHeader`          |
| ~~`table_row`~~       | `tableRow`             |
| ~~`todo_list`~~       | `taskList` (new name!) |
| ~~`todo_item`~~       | `taskItem` (new name!) |

## Removed methods
We removed the `.state()` method. No worries though, it’s still available through `editor.state`.

## New extension API
In case you’ve built some custom extensions for your project, you’re required to rewrite them to fit the new API. No worries, you can keep a lot of your work though. The `schema`, `commands`, `keys`, `inputRules` and `pasteRules` all work like they did before. It’s just different how you register them.

```js
import { Node } from '@tiptap/core'

const CustomExtension = Node.create({
  name: 'custom_extension',
  defaultOptions: {
    …
  },
  addAttributes() {
    …
  },
  parseHTML() {
    …
  },
  renderHTML({ node, HTMLAttributes }) {
    …
  },
  addCommands() {
    …
  },
  addKeyboardShortcuts() {
    …
  },
  addInputRules() {
    …
  },
  // and more …
})
```

Read more about [all the nifty details building custom extensions](/guide/custom-extensions) in our guide.

## Renamed settings and methods
[We renamed a lot of settings and methods](/api/editor). Hopefully you can migrate to the new API with search & replace. Here is a list of what changed:

| Old name        | New name    |
| --------------- | ----------- |
| ~~`autoFocus`~~ | `autofocus` |

## Renamed commands
All new extensions come with specific commands to set, unset and toggle styles. So instead of `.bold()`, it’s now `.toggleBold()`. Also, we switched to lowerCamelCase, below are a few examples. Oh, and we renamed `todo_list`, to `taskList`, sorry for that one.

| Old command              | New command                     |
| ------------------------ | ------------------------------- |
| `.redo()`                | `.redo()` (nothing changed)     |
| `.undo()`                | `.undo()` (nothing changed)     |
| ~~`.todo_list()`~~       | `.toggleTaskList()` (new name!) |
| ~~`.blockquote()`~~      | `.toggleBlockquote()`           |
| ~~`.bold()`~~            | `.toggleBold()`                 |
| ~~`.bullet_list()`~~     | `.toggleBulletList()`           |
| ~~`.code()`~~            | `.toggleCode()`                 |
| ~~`.code_block()`~~      | `.toggleCodeBlock()`            |
| ~~`.hard_break()`~~      | `.setHardBreak()`               |
| ~~`.heading()`~~         | `.toggleHeading()`              |
| ~~`.horizontal_rule()`~~ | `.setHorizontalRule()`          |
| ~~`.italic()`~~          | `.toggleItalic()`               |
| ~~`.link()`~~            | `.toggleLink()`                 |
| ~~`.ordered_list()`~~    | `.toggleOrderedList()`          |
| ~~`.paragraph()`~~       | `.setParagraph()`               |
| ~~`.strike()`~~          | `.toggleStrike()`               |
| ~~`.underline()`~~       | `.toggleUnderline()`            |
| …                        | …                               |

## MenuBar, BubbleMenu and FloatingMenu
Read the dedicated [guide on creating menus](/guide/menus) to migrate your menus.

## Commands can be chained now
Most commands can be combined to one call now. That’s shorter than separate function calls in most cases. Here is an example to make the selected text bold:

```js
editor.chain().toggleBold().focus().run()
```

The `.chain()` is required to start a new chain and the `.run()` is needed to actually execute all the commands in between. Read more about [the new Tiptap commands](/api/commands) in our API documentation.

## .focus() isn’t called on every command anymore
We tried to hide the `.focus()` command from you with Tiptap 1 and executed that on every command. That led to issues in specific use cases, where you want to run a command, but don’t want to focus the editor.

With Tiptap v2 you have to explicitly call the `focus()` and you probably want to do that in a lot of places. Here is an example:

```js
editor.chain().focus().toggleBold().run()
```

## Event callbacks have fewer parameters
The new event callbacks have fewer parameters. The same things should be available through `this.` now. [Read more about events here.](/api/events)

## Collaborative editing
The reference implementation for collaborative editing uses Y.js now. That’s a whole different thing. You still can use the Tiptap 1 extension, but it’s up to you to adapt it to the new extension API. If you’ve done this, don’t forget to share it with us so we can link to it from here!

Read more about [the new collaborative editing experience](/guide/collaborative-editing) in our guide.

## Marks don’t support node view anymore
For marks, node views are [not well supported in ProseMirror](https://discuss.prosemirror.net/t/there-is-a-bug-in-marks-nodeview/2722/2). There is also [a related issue](https://github.com/ueberdosis/tiptap/issues/613) for Tiptap 1. That’s why we removed it in Tiptap 2.

## Become a sponsor
tiptap wouldn’t exist without the funding of its community. If you fell in love with Tiptap, don’t forget to [become a sponsor](/sponsor) and make the maintenance, development and support sustainable.

In exchange, we’ll take you into our hearts, invite you to private repositories, add a `sponsor ♥` label to your issues and pull requests and more.
