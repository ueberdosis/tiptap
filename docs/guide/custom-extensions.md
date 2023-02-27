---
tableOfContents: true
---

# Custom extensions

## Introduction
One of the strengths of Tiptap is its extendability. You don’t depend on the provided extensions, it is intended to extend the editor to your liking.

With custom extensions you can add new content types and new functionalities, on top of what already exists or from scratch. Let’s start with a few common examples of how you can extend existing nodes, marks and extensions.

You’ll learn how you start from scratch at the end, but you’ll need the same knowledge for extending existing and creating new extensions.

## Extend existing extensions
Every extension has an `extend()` method, which takes an object with everything you want to change or add to it.

Let’s say, you’d like to change the keyboard shortcut for the bullet list. You should start with looking at the source code of the extension, in that case [the `BulletList` node](https://github.com/ueberdosis/tiptap/blob/main/packages/extension-bullet-list/src/bullet-list.ts). For the bespoken example to overwrite the keyboard shortcut, your code could look like that:

```js
// 1. Import the extension
import BulletList from '@tiptap/extension-bullet-list'

// 2. Overwrite the keyboard shortcuts
const CustomBulletList = BulletList.extend({
  addKeyboardShortcuts() {
    return {
      'Mod-l': () => this.editor.commands.toggleBulletList(),
    }
  },
})

// 3. Add the custom extension to your editor
new Editor({
  extensions: [
    CustomBulletList(),
    // …
  ],
})
```

The same applies to every aspect of an existing extension, except to the name. Let’s look at all the things that you can change through the extend method. We focus on one aspect in every example, but you can combine all those examples and change multiple aspects in one `extend()` call too.

### Name
The extension name is used in a whole lot of places and changing it isn’t too easy. If you want to change the name of an existing extension, you can copy the whole extension and change the name in all occurrences.

The extension name is also part of the JSON. If you [store your content as JSON](/guide/output#option-1-json), you need to change the name there too.

### Priority
The priority defines the order in which extensions are registered. The default priority is `100`, that’s what most extension have. Extensions with a higher priority will be loaded earlier.

```js
import Link from '@tiptap/extension-link'

const CustomLink = Link.extend({
  priority: 1000,
})
```

The order in which extensions are loaded influences two things:

1. #### Plugin order
   ProseMirror plugins of extensions with a higher priority will run first.

2. #### Schema order
   The [`Link`](/api/marks/link) mark for example has a higher priority, which means it will be rendered as `<a href="…"><strong>Example</strong></a>` instead of `<strong><a href="…">Example</a></strong>`.

### Settings
All settings can be configured through the extension anyway, but if you want to change the default settings, for example to provide a library on top of Tiptap for other developers, you can do it like that:

```js
import Heading from '@tiptap/extension-heading'

const CustomHeading = Heading.extend({
  addOptions() {
    return {
      ...this.parent?.(),
      levels: [1, 2, 3],
    }
  },
})
```

### Storage
At some point you probably want to save some data within your extension instance. This data is mutable. You can access it within the extension under `this.storage`.

```js
import { Extension } from '@tiptap/core'

const CustomExtension = Extension.create({
  name: 'customExtension',

  addStorage() {
    return {
      awesomeness: 100,
    }
  },

  onUpdate() {
    this.storage.awesomeness += 1
  },
})
```

Outside the extension you have access via `editor.storage`. Make sure that each extension has a unique name.

```js
const editor = new Editor({
  extensions: [
    CustomExtension,
  ],
})

const awesomeness = editor.storage.customExtension.awesomeness
```

### Schema
Tiptap works with a strict schema, which configures how the content can be structured, nested, how it behaves and many more things. You [can change all aspects of the schema](/api/schema) for existing extensions. Let’s walk through a few common use cases.

The default `Blockquote` extension can wrap other nodes, like headings. If you want to allow nothing but paragraphs in your blockquotes, set the `content` attribute accordingly:

```js
// Blockquotes must only include paragraphs
import Blockquote from '@tiptap/extension-blockquote'

const CustomBlockquote = Blockquote.extend({
  content: 'paragraph*',
})
```

The schema even allows to make your nodes draggable, that’s what the `draggable` option is for. It defaults to `false`, but you can override that.

```js
// Draggable paragraphs
import Paragraph from '@tiptap/extension-paragraph'

const CustomParagraph = Paragraph.extend({
  draggable: true,
})
```

That’s just two tiny examples, but [the underlying ProseMirror schema](https://prosemirror.net/docs/ref/#model.SchemaSpec) is really powerful.

### Attributes
You can use attributes to store additional information in the content. Let’s say you want to extend the default `Paragraph` node to have different colors:

```js
const CustomParagraph = Paragraph.extend({
  addAttributes() {
    // Return an object with attribute configuration
    return {
      color: {
        default: 'pink',
      },
    },
  },
})

// Result:
// <p color="pink">Example Text</p>
```

That is already enough to tell Tiptap about the new attribute, and set `'pink'` as the default value. All attributes will be rendered as a HTML attribute by default, and parsed from the content when initiated.

Let’s stick with the color example and assume you want to add an inline style to actually color the text. With the `renderHTML` function you can return HTML attributes which will be rendered in the output.

This examples adds a style HTML attribute based on the value of `color`:

```js
const CustomParagraph = Paragraph.extend({
  addAttributes() {
    return {
      color: {
        default: null,
        // Take the attribute values
        renderHTML: attributes => {
          // … and return an object with HTML attributes.
          return {
            style: `color: ${attributes.color}`,
          }
        },
      },
    }
  },
})

// Result:
// <p style="color: pink">Example Text</p>
```

You can also control how the attribute is parsed from the HTML. Maybe you want to store the color in an attribute called `data-color` (and not just `color`), here’s how you would do that:

```js
const CustomParagraph = Paragraph.extend({
  addAttributes() {
    return {
      color: {
        default: null,
        // Customize the HTML parsing (for example, to load the initial content)
        parseHTML: element => element.getAttribute('data-color'),
        // … and customize the HTML rendering.
        renderHTML: attributes => {
          return {
            'data-color': attributes.color,
            style: `color: ${attributes.color}`,
          }
        },
      },
    }
  },
})

// Result:
// <p data-color="pink" style="color: pink">Example Text</p>
```

You can completely disable the rendering of attributes with `rendered: false`.

#### Extend existing attributes
If you want to add an attribute to an extension and keep existing attributes, you can access them through `this.parent()`.

In some cases, it is undefined, so make sure to check for that case, or use optional chaining `this.parent?.()`

```js
const CustomTableCell = TableCell.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      myCustomAttribute: {
        // …
      },
    }
  },
})
```

### Global attributes
Attributes can be applied to multiple extensions at once. That’s useful for text alignment, line height, color, font family, and other styling related attributes.

Take a closer look at [the full source code](https://github.com/ueberdosis/tiptap/tree/main/packages/extension-text-align) of the [`TextAlign`](/api/extensions/text-align) extension to see a more complex example. But here is how it works in a nutshell:

```js
import { Extension } from '@tiptap/core'

const TextAlign = Extension.create({
  addGlobalAttributes() {
    return [
      {
        // Extend the following extensions
        types: [
          'heading',
          'paragraph',
        ],
        // … with those attributes
        attributes: {
          textAlign: {
            default: 'left',
            renderHTML: attributes => ({
              style: `text-align: ${attributes.textAlign}`,
            }),
            parseHTML: element => element.style.textAlign || 'left',
          },
        },
      },
    ]
  },
})
```

### Render HTML
With the `renderHTML` function you can control how an extension is rendered to HTML. We pass an attributes object to it, with all local attributes, global attributes, and configured CSS classes. Here is an example from the `Bold` extension:

```js
renderHTML({ HTMLAttributes }) {
  return ['strong', HTMLAttributes, 0]
},
```

The first value in the array should be the name of HTML tag. If the second element is an object, it’s interpreted as a set of attributes. Any elements after that are rendered as children.

The number zero (representing a hole) is used to indicate where the content should be inserted. Let’s look at the rendering of the `CodeBlock` extension with two nested tags:

```js
renderHTML({ HTMLAttributes }) {
  return ['pre', ['code', HTMLAttributes, 0]]
},
```

If you want to add some specific attributes there, import the `mergeAttributes` helper from `@tiptap/core`:

```js
import { mergeAttributes } from '@tiptap/core'

// ...

renderHTML({ HTMLAttributes }) {
  return ['a', mergeAttributes(HTMLAttributes, { rel: this.options.rel }), 0]
},
```

### Parse HTML
The `parseHTML()` function tries to load the editor document from HTML. The function gets the HTML DOM element passed as a parameter, and is expected to return an object with attributes and their values. Here is a simplified example from the [`Bold`](/api/marks/bold) mark:

```js
parseHTML() {
  return [
    {
      tag: 'strong',
    },
  ]
},
```

This defines a rule to convert all `<strong>` tags to `Bold` marks. But you can get more advanced with this, here is the full example from the extension:

```js
parseHTML() {
  return [
    // <strong>
    {
      tag: 'strong',
    },
    // <b>
    {
      tag: 'b',
      getAttrs: node => node.style.fontWeight !== 'normal' && null,
    },
    // <span style="font-weight: bold"> and <span style="font-weight: 700">
    {
      style: 'font-weight',
      getAttrs: value => /^(bold(er)?|[5-9]\d{2,})$/.test(value as string) && null,
    },
  ]
},
```

This checks for `<strong>` and `<b>` tags, and any HTML tag with an inline style setting the `font-weight` to bold.

As you can see, you can optionally pass a `getAttrs` callback, to add more complex checks, for example for specific HTML attributes. The callback gets passed the HTML DOM node, except when checking for the `style` attribute, then it’s the value.

You are wondering what’s that `&& null` doing? [ProseMirror expects `null` or `undefined` if the check is successful.](https://prosemirror.net/docs/ref/version/0.18.0.html#model.ParseRule.getAttrs)

[Pass `priority` to a rule](https://prosemirror.net/docs/ref/version/0.18.0.html#model.ParseRule.priority) to resolve conflicts with other extensions, for example if you build a custom extension which looks for paragraphs with a class attribute, but you already use the default paragraph extension.

#### Using getAttrs
The `getAttrs` function you’ve probably noticed in the example has two purposes:

1. Check the HTML attributes to decide whether a rule matches (and a mark or node is created from that HTML). When the function returns `false`, it’s not matching.
2. Get the DOM Element and use the HTML attributes to set your mark or node attributes accordingly:

```js
parseHTML() {
  return [
    {
      tag: 'span',
      getAttrs: element => {
        // Check if the element has an attribute
        element.hasAttribute('style')
        // Get an inline style
        element.style.color
        // Get a specific attribute
        element.getAttribute('data-color')
      },
    },
  ]
},
```

You can return an object with the attribute as the key and the parsed value to set your mark or node attribute. We would recommend to use the `parseHTML` inside `addAttributes()`, though. That will keep your code cleaner.

```js
addAttributes() {
  return {
    color: {
      // Set the color attribute according to the value of the `data-color` attribute
      parseHTML: element => element.getAttribute('data-color'),
    }
  }
},
```

Read more about `getAttrs` and all other `ParseRule` properties in the [ProseMirror reference](https://prosemirror.net/docs/ref/#model.ParseRule).

### Commands
```js
import Paragraph from '@tiptap/extension-paragraph'

const CustomParagraph = Paragraph.extend({
  addCommands() {
    return {
      paragraph: () => ({ commands }) => {
        return commands.setNode('paragraph')
      },
    }
  },
})
```

:::warning Use the commands parameter inside of addCommands
To access other commands inside `addCommands` use the `commands` parameter that’s passed to it.
:::

### Keyboard shortcuts
Most core extensions come with sensible keyboard shortcut defaults. Depending on what you want to build, you’ll likely want to change them though. With the `addKeyboardShortcuts()` method you can overwrite the predefined shortcut map:

```js
// Change the bullet list keyboard shortcut
import BulletList from '@tiptap/extension-bullet-list'

const CustomBulletList = BulletList.extend({
  addKeyboardShortcuts() {
    return {
      'Mod-l': () => this.editor.commands.toggleBulletList(),
    }
  },
})
```

### Input rules
With input rules you can define regular expressions to listen for user inputs. They are used for markdown shortcuts, or for example to convert text like `(c)` to a `©` (and many more) with the [`Typography`](/api/extensions/typography) extension. Use the `markInputRule` helper function for marks, and the `nodeInputRule` for nodes.

By default text between two tildes on both sides is transformed to ~~striked text~~. If you want to think one tilde on each side is enough, you can overwrite the input rule like this:

```js
// Use the ~single tilde~ markdown shortcut
import Strike from '@tiptap/extension-strike'
import { markInputRule } from '@tiptap/core'

// Default:
// const inputRegex = /(?:^|\s)((?:~~)((?:[^~]+))(?:~~))$/

// New:
const inputRegex = /(?:^|\s)((?:~)((?:[^~]+))(?:~))$/

const CustomStrike = Strike.extend({
  addInputRules() {
    return [
      markInputRule({
        find: inputRegex,
        type: this.type,
      }),
    ]
  },
})
```

### Paste rules
Paste rules work like input rules (see above) do. But instead of listening to what the user types, they are applied to pasted content.

There is one tiny difference in the regular expression. Input rules typically end with a `$` dollar sign (which means “asserts position at the end of a line”), paste rules typically look through all the content and don’t have said `$` dollar sign.

Taking the example from above and applying it to the paste rule would look like the following example.

```js
// Check pasted content for the ~single tilde~ markdown syntax
import Strike from '@tiptap/extension-strike'
import { markPasteRule } from '@tiptap/core'

// Default:
// const pasteRegex = /(?:^|\s)((?:~~)((?:[^~]+))(?:~~))/g

// New:
const pasteRegex = /(?:^|\s)((?:~)((?:[^~]+))(?:~))/g

const CustomStrike = Strike.extend({
  addPasteRules() {
    return [
      markPasteRule({
        find: pasteRegex,
        type: this.type,
      }),
    ]
  },
})
```

### Events
You can even move your [event listeners](/api/events) to a separate extension. Here is an example with listeners for all events:

```js
import { Extension } from '@tiptap/core'

const CustomExtension = Extension.create({
  onCreate() {
    // The editor is ready.
  },
  onUpdate() {
    // The content has changed.
  },
  onSelectionUpdate({ editor }) {
    // The selection has changed.
  },
  onTransaction({ transaction }) {
    // The editor state has changed.
  },
  onFocus({ event }) {
    // The editor is focused.
  },
  onBlur({ event }) {
    // The editor isn’t focused anymore.
  },
  onDestroy() {
    // The editor is being destroyed.
  },
})
```

### What’s available in this?
Those extensions aren’t classes, but you still have a few important things available in `this` everywhere in the extension.

```js
// Name of the extension, for example 'bulletList'
this.name

// Editor instance
this.editor

// ProseMirror type
this.type

// Object with all settings
this.options

// Everything that’s in the extended extension
this.parent
```

### ProseMirror Plugins (Advanced)
After all, Tiptap is built on ProseMirror and ProseMirror has a pretty powerful plugin API, too. To access that directly, use `addProseMirrorPlugins()`.

#### Existing plugins
You can wrap existing ProseMirror plugins in Tiptap extensions like shown in the example below.

```js
import { history } from '@tiptap/pm/history'

const History = Extension.create({
  addProseMirrorPlugins() {
    return [
      history(),
      // …
    ]
  },
})
```

#### Access the ProseMirror API
To hook into events, for example a click, double click or when content is pasted, you can pass [event handlers](https://prosemirror.net/docs/ref/#view.EditorProps) to `editorProps` on the [editor](/api/editor#editor-props).

Or you can add them to a Tiptap extension like shown in the below example.

```js
import { Extension } from '@tiptap/core'
import { Plugin, PluginKey } from '@tiptap/pm/state'

export const EventHandler = Extension.create({
  name: 'eventHandler',

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey('eventHandler'),
        props: {
          handleClick(view, pos, event) { /* … */ },
          handleDoubleClick(view, pos, event) { /* … */ },
          handlePaste(view, event, slice) { /* … */ },
          // … and many, many more.
          // Here is the full list: https://prosemirror.net/docs/ref/#view.EditorProps
        },
      }),
    ]
  },
})
```

### Node views (Advanced)
For advanced use cases, where you need to execute JavaScript inside your nodes, for example to render a sophisticated interface around an image, you need to learn about node views.

They are really powerful, but also complex. In a nutshell, you need to return a parent DOM element, and a DOM element where the content should be rendered in. Look at the following, simplified example:

```js
import Image from '@tiptap/extension-image'

const CustomImage = Image.extend({
  addNodeView() {
    return () => {
      const container = document.createElement('div')

      container.addEventListener('click', event => {
        alert('clicked on the container')
      })

      const content = document.createElement('div')
      container.append(content)

      return {
        dom: container,
        contentDOM: content,
      }
    }
  },
})
```

There is a whole lot to learn about node views, so head over to the [dedicated section in our guide about node views](/guide/node-views) for more information. If you are looking for a real-world example, look at the source code of the [`TaskItem`](/api/nodes/task-item) node. This is using a node view to render the checkboxes.

## Create new extensions
You can build your own extensions from scratch and you know what? It’s the same syntax as for extending existing extension described above.

### Create a node
If you think of the document as a tree, then [nodes](/api/nodes) are just a type of content in that tree. Good examples to learn from are [`Paragraph`](/api/nodes/paragraph), [`Heading`](/api/nodes/heading), or [`CodeBlock`](/api/nodes/code-block).

```js
import { Node } from '@tiptap/core'

const CustomNode = Node.create({
  name: 'customNode',

  // Your code goes here.
})
```

Nodes don’t have to be blocks. They can also be rendered inline with the text, for example for [@mentions](/api/nodes/mention).

### Create a mark
One or multiple marks can be applied to [nodes](/api/nodes), for example to add inline formatting. Good examples to learn from are [`Bold`](/api/marks/bold), [`Italic`](/api/marks/italic) and [`Highlight`](/api/marks/highlight).

```js
import { Mark } from '@tiptap/core'

const CustomMark = Mark.create({
  name: 'customMark',

  // Your code goes here.
})
```

### Create an extension
Extensions add new capabilities to Tiptap and you’ll read the word extension here very often, even for nodes and marks. But there are literal extensions. Those can’t add to the schema (like marks and nodes do), but can add functionality or change the behaviour of the editor.

A good example to learn from is probably [`TextAlign`](/api/extensions/text-align).

```js
import { Extension } from '@tiptap/core'

const CustomExtension = Extension.create({
  name: 'customExtension',

  // Your code goes here.
})
```

## Creating and publishing standalone extensions
If you want to create and publish your own extensions for Tiptap, you can use our CLI tool to bootstrap your project.
Simply run `npm init tiptap-extension` and follow the instructions. The CLI will create a new folder with a pre-configured project for you including a build script running on Rollup.

If you want to test your extension locally, you can run `npm link` in the project folder and then `npm link YOUR_EXTENSION` in your project (for example a Vite app).

## Sharing
When everything is working fine, don’t forget to [share it with the community](https://github.com/ueberdosis/tiptap/issues/819) or in our [awesome-tiptap](https://github.com/ueberdosis/awesome-tiptap) repository.
