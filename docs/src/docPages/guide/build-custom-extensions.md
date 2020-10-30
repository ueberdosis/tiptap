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
The extension name is used in a whole lot of places and changing it isn’t too easy. If you want to change the name of an extension, it’s recommended to copy the whole extension and change the name in all occurrences.

The extension name is also part of the JSON. If you [store your content as JSON](http://localhost:3000/guide/store-content#option-1-json), you need to change the name in there too.

### Settings
All settings can be overwritten through the extension anyway, but if you want to change the defaults, for example to provide a library on top of tiptap for other developers, you can do it like that:

```js
import Heading from '@tiptap/extension-heading'

const CustomHeading = Heading.extend({
  defaultOptions: {
    levels: [1, 2, 3],
  },
})
```

### Node Schema
Tiptap works with a [strict schema](/api/schema), which configures how the content can be structured, nested, how it behaves and many more things. You can change all aspects of the schema for existing extensions. Let’s walk through a few common use cases.

The default `Blockquote` extension can wrap other nodes, like headings. If you want to allow nothing but paragraphs in your blockquotes, this is how you could achieve it:


#### Content
> The content expression for this node, as described in the schema guide. When not given, the node does not allow any content.

```js
// blockquotes include paragraphs only
import Blockquote from '@tiptap/extension-blockquote'

const CustomBlockquote = Blockquote.extend({
  content: 'paragraph*',
})
```

#### Marks
> The marks that are allowed inside of this node. May be a space-separated string referring to mark names or groups, "_" to explicitly allow all marks, or "" to disallow marks. When not given, nodes with inline content default to allowing all marks, other nodes default to not allowing marks.

#### Group
> The group or space-separated groups to which this node belongs, which can be referred to in the content expressions for the schema.

#### Inline
> Should be set to true for inline nodes. (Implied for text nodes.)

#### Atom
> Can be set to true to indicate that, though this isn't a leaf node, it doesn't have directly editable content and should be treated as a single unit in the view.

#### Selectable
> Controls whether nodes of this type can be selected as a node selection. Defaults to true for non-text nodes.

#### Draggable
> Determines whether nodes of this type can be dragged without being selected. Defaults to false.

The schema even allows to make your nodes draggable, that’s what the `draggable` option is for, which defaults to `false`. Here is an example for draggable paragraphs:

```js
// Draggable paragraphs
import Paragraph from '@tiptap/extension-paragraph'

const CustomParagraph = Paragraph.extend({
  draggable: true,
})
```

#### Code
> Can be used to indicate that this node contains code, which causes some commands to behave differently.

#### Defining
> Determines whether this node is considered an important parent node during replace operations (such as paste). Non-defining (the default) nodes get dropped when their entire content is replaced, whereas defining nodes persist and wrap the inserted content. Likewise, in inserted content the defining parents of the content are preserved when possible. Typically, non-default-paragraph textblock types, and possibly list items, are marked as defining.

#### Isolating
> When enabled (default is false), the sides of nodes of this type count as boundaries that regular editing operations, like backspacing or lifting, won't cross. An example of a node that should probably have this enabled is a table cell.

### Mark Schema
#### Inclusive
> Whether this mark should be active when the cursor is positioned at its end (or at its start when that is also the start of the parent node). Defaults to true.

#### Excludes
> Determines which other marks this mark can coexist with. Should be a space-separated strings naming other marks or groups of marks When a mark is added to a set, all marks that it excludes are removed in the process. If the set contains any mark that excludes the new mark but is not, itself, excluded by the new mark, the mark can not be added an the set. You can use the value "_" to indicate that the mark excludes all marks in the schema.

> Defaults to only being exclusive with marks of the same type. You can set it to an empty string (or any string not containing the mark's own name) to allow multiple marks of a given type to coexist (as long as they have different attributes).

#### Group
> The group or space-separated groups to which this mark belongs.

#### Spanning
> Determines whether marks of this type can span multiple adjacent nodes when serialized to DOM/HTML. Defaults to true.

### Attributes
You can use attributes to store additional information in the content. Let’s say you want to extend the default paragraph extension with a color attribute to allow paragraphs to have different colors:

```js
const CustomParagraph = Paragraph.extend({
  addAttributes() {
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

Let’s stick with the color example and assume you’ll probably want to add an inline style to actually color the text. Add a `renderHTML` function and return the attributes that should be added to the rendered HTML. This examples adds a style attribute based on the value of color:

```js
const CustomParagraph = Paragraph.extend({
  addAttributes() {
    return {
      color: {
        default: null,
        renderHTML: attributes => {
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
        parseHTML: element => {
          return {
            color: element.getAttribute('data-my-fancy-color-attribute'),
          }
        },
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
> TextAlign

### Parse HTML
> Associates DOM parser information with this mark (see the corresponding node spec field). The mark field in the rules is implied.

### Render HTML
> Defines the default way marks of this type should be serialized to DOM/HTML. When the resulting spec contains a hole, that is where the marked content is placed. Otherwise, it is appended to the top node.

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
