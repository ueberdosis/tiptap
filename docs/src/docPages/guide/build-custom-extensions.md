# Build custom extensions

## toc

## Introduction
One of the strength of tiptap is it’s extendability. You don’t depend on the provided extensions, it’s intended to extend the editor to your liking. With custom extensions you can add new content types and new functionalities, on top of what already exists or starting from scratch.

## Option 1: Extend existing extensions
Let’s say you want to change the keyboard shortcuts for the bullet list. You should start by looking at [the source code of the `BulletList` extension](https://github.com/ueberdosis/tiptap-next/blob/main/packages/extension-bullet-list/index.ts) and find the part you would like to change. In that case, the keyboard shortcut, and just that.

Every extension has an `extend()` method, which takes an object with everything you want to change or add to it. For the bespoken example, your code could like that:

```js
// 1. Import the extension
import BulletList from '@tiptap/extension-bullet-list'

// 2. Overwrite the keyboard shortcuts
const CustomBulletList = BulletList.extend({
  addKeyboardShortcuts() {
    return {
      'Mod-l': () => this.editor.bulletList(),
    }
  },
})

// 3. Add the custom extension to your editor
new Editor({
  extensions: [
    CustomBulletList(),
    // …
  ]
})
```

The same applies to every aspect of an existing extension, except to the name. Let’s look at all the things that you can change through the extend method. We focus on one aspect in every example, but you can combine all those examples and change multiple aspects in one `extend()` call too.

### Name
The extension name is used in a whole lot of places and changing it isn’t too easy. If you want to change the name of an existing extension, we would recommended to copy the whole extension and change the name in all occurrences.

The extension name is also part of the JSON. If you [store your content as JSON](/guide/store-content#option-1-json), you need to change the name there too.

### Settings
All settings can be configured through the extension anyway, but if you want to change the default settings, for example to provide a library on top of tiptap for other developers, you can do it like that:

```js
import Heading from '@tiptap/extension-heading'

const CustomHeading = Heading.extend({
  defaultOptions: {
    levels: [1, 2, 3],
  },
})
```

### Schema
tiptap works with a strict schema, which configures how the content can be structured, nested, how it behaves and many more things. You [can change all aspects of the schema](/api/schema) for existing extensions. Let’s walk through a few common use cases.

The default `Blockquote` extension can wrap other nodes, like headings. If you want to allow nothing but paragraphs in your blockquotes, this is how you could achieve it:

```js
// Blockquotes must only include paragraphs
import Blockquote from '@tiptap/extension-blockquote'

const CustomBlockquote = Blockquote.extend({
  content: 'paragraph*',
})
```

The schema even allows to make your nodes draggable, that’s what the `draggable` option is for, which defaults to `false`.

```js
// Draggable paragraphs
import Paragraph from '@tiptap/extension-paragraph'

const CustomParagraph = Paragraph.extend({
  draggable: true,
})
```

That’s just two tiny examples, but [the underlying ProseMirror schema](https://prosemirror.net/docs/ref/#model.SchemaSpec) is really powerful. You should definitely read the documentation to understand all the nifty details.

### Attributes
You can use attributes to store additional information in the content. Let’s say you want to extend the default paragraph extension to enable paragraphs to have different colors:

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
// <p data-color="pink">Example Text</p>
```

That’s already enough to tell tiptap about the new attribute, and set `'pink'` as the default value. All attributes will be rendered as a data-attributes by default, and parsed as data-attributes from the content.

Let’s stick with the color example and assume you’ll want to add an inline style to actually color the text. With the `renderHTML` function you can return HTML attributes which will be rendered in the output.

This examples adds a style HTML attribute based on the value of color:

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
// <p data-color="pink" style="color: pink">Example Text</p>
```

You can also control how the attribute is parsed from the HTML. Let’s say you want to store the color in an attribute called `data-my-fancy-color-attribute`. Legit, right? Anyway, here’s how you would do that:

```js
const CustomParagraph = Paragraph.extend({
  addAttributes() {
    return {
      color: {
        default: null,
        // Customize the HTML parsing (for example, to load the initial content)
        parseHTML: element => {
          return {
            color: element.getAttribute('data-my-fancy-color-attribute'),
          }
        },
        // … and customize the HTML rendering.
        renderHTML: attributes => {
          return {
            'data-my-fancy-color-attribute': atttributes.color,
            style: `color: ${attributes.color}`,
          }
        },
      },
    }
  },
})

// Result:
// <p data-my-fancy-color-attribute="pink" style="color: pink">Example Text</p>
```

### Global Attributes
Attributes can be applied to multiple extensions at once. That’s useful for text alignment, line height, color, font family, and other styling related attributes.

Take a closer look at [the full source code](https://github.com/ueberdosis/tiptap-next/tree/main/packages/extension-text-align) of the [`TextAlign`](/api/extensions/text-align) extension to see a more complex example. But here is how it works in a nutshell:

```js
import { createExtension } from '@tiptap/core'

const TextAlign = createExtension({
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
            parseHTML: element => ({
              textAlign: element.style.textAlign || 'left',
            }),
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
renderHTML({ attributes }) {
  return ['strong', attributes, 0]
},
```

The first value in the array should be the name of HTML tag. If the second element is an object, it’s interpreted as a set of attributes. Any elements after that are rendered as children.

The number zero (representing a hole) is used to indicate where the content should be inserted. Let’s look at the rendering of the `CodeBlock` extension with two nested tags:

```js
renderHTML({ attributes }) {
  return ['pre', ['code', attributes, 0]]
},
```

If you want to add some specific attributes there, import the `mergeAttributes` helper from `@tiptap/core`:

```js
renderHTML({ attributes }) {
  return ['a', mergeAttributes(attributes, { rel: this.options.rel }), 0]
},
```

### Parse HTML
> Associates DOM parser information with this mark (see the corresponding node spec field). The mark field in the rules is implied.

### Commands

```js
import Paragraph from '@tiptap/extension-paragraph'

const CustomParagraph = Paragraph.extend({
  addCommands() {
    return {
      paragraph: () => ({ commands }) => {
        return commands.toggleBlockType('paragraph', 'paragraph')
      },
    }
  },
})
```

### Keyboard shortcuts
Most core extensions come with sensible keyboard shortcut defaults. Depending on what you want to build, you’ll likely want to change them though. With the `addKeyboardShortcuts()` method you can overwrite the predefined shortcut map:

```js
// Change the bullet list keyboard shortcut
import BulletList from '@tiptap/extension-bullet-list'

const CustomBulletList = BulletList.extend({
  addKeyboardShortcuts() {
    return {
      'Mod-l': () => this.editor.bulletList(),
    }
  },
})
```

### Input rules

```js
// Use the ~single tilde~ markdown shortcut
import Strike from '@tiptap/extension-strike'
import { markInputRule } from '@tiptap/core'

const inputRegex = /(?:^|\s)((?:~)((?:[^~]+))(?:~))$/gm

const CustomStrike = Strike.extend({
  addInputRules() {
    return [
      markInputRule(inputRegex, this.type),
    ]
  },
})
```

### Paste rules

```js
// Overwrite the underline regex for pasted text
import Underline from '@tiptap/extension-underline'
import { markPasteRule } from '@tiptap/core'

const pasteRegex = /(?:^|\s)((?:~)((?:[^~]+))(?:~))$/gm

const CustomUnderline = Underline.extend({
  addPasteRules() {
    return [
      markPasteRule(inputRegex, this.type),
    ]
  },
})
```

## Option 2: Start from scratch

### Read the documentation
Although tiptap tries to hide most of the complexity of ProseMirror, it’s built on top of its APIs and we recommend you to read through the [ProseMirror Guide](https://ProseMirror.net/docs/guide/) for advanced usage. You’ll have a better understanding of how everything works under the hood and get more familiar with many terms and jargon used by tiptap.

### Have a look at existing extensions

### Get started

### Ask questions

### Share your extension
