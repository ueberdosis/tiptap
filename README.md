> We’re working on [tiptap 2](https://blog.ueber.io/post/tiptap-2-0-beta/). Become a sponsor to get access immediately! [Sponsor 💖](https://github.com/sponsors/ueberdosis)

# tiptap
A renderless and extendable rich-text editor for [Vue.js](https://github.com/vuejs/vue)

[![Gitpod Ready-to-Code](https://img.shields.io/badge/Gitpod-Ready--to--Code-blue?logo=gitpod)](https://gitpod.io/#https://github.com/ueberdosis/tiptap)
[![Version](https://img.shields.io/npm/v/tiptap.svg?label=version)](https://www.npmjs.com/package/tiptap)
[![Downloads](https://img.shields.io/npm/dm/tiptap.svg)](https://npmcharts.com/compare/tiptap?minimal=true)
[![License](https://img.shields.io/npm/l/tiptap.svg)](https://www.npmjs.com/package/tiptap)
[![Filesize](https://img.badgesize.io/https://unpkg.com/tiptap/dist/tiptap.min.js?compression=gzip&label=size&colorB=000000)](https://www.npmjs.com/package/tiptap)
[![Build Status](https://github.com/ueberdosis/tiptap/workflows/ci/badge.svg)](https://github.com/ueberdosis/tiptap/actions)
[![Sponsor](https://img.shields.io/static/v1?label=Sponsor&message=%E2%9D%A4&logo=GitHub)](https://github.com/sponsors/ueberdosis)

## [FAQ] Should I start to integrate tiptap 1 or wait for tiptap 2?
Good question! [tiptap 2](https://blog.ueber.io/post/tiptap-2-0-beta/) is about to come in the next months and we’re going to provide an upgrade guide for you. Sure, there are a lot of things that will change, but you should be able to refactor everything in an hour so (depending on the size of your project).

The extension API will have a lot of breaking changes. So if you’re up to write a lot of custom extensions, expect to rewrite them for tiptap 2. You’ll likely reuse all the single parts (schema, inputRules, pasteRules, keyboard shortcuts …), but the API to register them will be different.

**For the braves:** [Sponsor us](https://github.com/sponsors/ueberdosis) to get access to tiptap 2 and start your project with a fresh breeze of air.

**For everyone else:** No need to wait for tiptap 2. Start your project, you’ll be able to upgrade in a reasonable amount of time.

## Why I built tiptap
I was looking for a text editor for [Vue.js](https://github.com/vuejs/vue) and found some solutions that didn't really satisfy me. The editor should be easy to extend and not based on old dependencies such as jQuery. For React there is already a great editor called [Slate.js](https://github.com/ianstormtaylor/slate), which impresses with its modularity. I came across [Prosemirror](https://github.com/prosemirror) and decided to build on it. Prosemirror is a toolkit for building rich-text editors that are already in use at many well-known companies such as *Atlassian* or *New York Times*.

### What does `renderless` mean?

With renderless components you'll have (almost) full control over markup and styling. I don't want to tell you what a menu should look like or where it should be rendered in the DOM. That's all up to you. There is also a [good article about renderless components](https://adamwathan.me/renderless-components-in-vuejs/) by Adam Wathan.

### How is the data stored under the hood?

You can save your data as a raw `HTML` string or can get a `JSON`-serializable representation of your document. And of course, you can pass these two types back to the editor.

## 💖 Sponsor the development

Are you using tiptap in production? We need your sponsorship to maintain, update and develop tiptap. [Become a Sponsor now!](https://github.com/sponsors/ueberdosis)

## Examples
To check out some live examples, visit [tiptap.dev](https://tiptap.dev/).

## Installation
```
npm install tiptap
```
or
```
yarn add tiptap
```

## Basic Setup
```vue
<template>
  <editor-content :editor="editor" />
</template>

<script>
// Import the editor
import { Editor, EditorContent } from 'tiptap'

export default {
  components: {
    EditorContent,
  },
  data() {
    return {
      editor: null,
    }
  },
  mounted() {
    this.editor = new Editor({
      content: '<p>This is just a boring paragraph</p>',
    })
  },
  beforeDestroy() {
    this.editor.destroy()
  },
}
</script>
```

## Editor Properties

| **Property**           |     **Type**     | **Default** | **Description**                                                                                                                                   |
| ---------------------- | :--------------: | :---------: | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| `content`              | `Object\|String` |   `null`    | The editor state object used by Prosemirror. You can also pass HTML to the `content` slot. When used both, the `content` slot will be ignored.    |
| `editorProps`          |     `Object`     |    `{}`     | A list of [Prosemirror editorProps](https://prosemirror.net/docs/ref/#view.EditorProps).                                                          |
| `editable`             |    `Boolean`     |   `true`    | When set to `false` the editor is read-only.                                                                                                      |
| `autoFocus`            |    `Boolean`     |   `false`   | Focus the editor on init.                                                                                                                         |
| `extensions`           |     `Array`      |    `[]`     | A list of extensions used, by the editor. This can be `Nodes`, `Marks` or `Plugins`.                                                              |
| `useBuiltInExtensions` |    `Boolean`     |   `true`    | By default tiptap adds a `Doc`, `Paragraph` and `Text` node to the Prosemirror schema.                                                            |
| `dropCursor`           |     `Object`     |    `{}`     | Config for `prosemirror-dropcursor`.                                                                                                              |
| `enableDropCursor`     |    `Boolean`     |   `true`    | Option to enable / disable the dropCursor plugin.                                                                                                 |
| `enableGapCursor`      |    `Boolean`     |   `true`    | Option to enable / disable the gapCursor plugin.                                                                                                  |
| `parseOptions`         |     `Object`     |    `{}`     | A list of [Prosemirror parseOptions](https://prosemirror.net/docs/ref/#model.ParseOptions).                                                       |
| `onInit`               |    `Function`    | `undefined` | This will return an Object with the current `state` and `view` of Prosemirror on init.                                                            |
| `onFocus`              |    `Function`    | `undefined` | This will return an Object with the `event` and current `state` and `view` of Prosemirror on focus.                                               |
| `onBlur`               |    `Function`    | `undefined` | This will return an Object with the `event` and current `state` and `view` of Prosemirror on blur.                                                |
| `onUpdate`             |    `Function`    | `undefined` | This will return an Object with the current `state` of Prosemirror, a `getJSON()` and `getHTML()` function and the `transaction` on every change. |

## Editor Methods

| **Method**       |            **Arguments**            | **Description**                                                                                                                                                                                                                               |
| ---------------- | :---------------------------------: | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `setContent`     | `content, emitUpdate, parseOptions` | Replace the current content. You can pass an HTML string or a JSON document. `emitUpdate` defaults to `false`. `parseOptions` defaults to those provided in constructor.                                                                      |
| `clearContent`   |            `emitUpdate`             | Clears the current content. `emitUpdate` defaults to `false`.                                                                                                                                                                                 |
| `setOptions`     |              `options`              | Overwrites the current editor properties.                                                                                                                                                                                                     |
| `registerPlugin` |      `plugin`, `handlePlugins`      | Register a Prosemirror plugin. You can pass a function `handlePlugins` with parameters `(plugin, oldPlugins)` to define an order in which `newPlugins` will be called. `handlePlugins` defaults to pushing `plugin` to front of `oldPlugins`. |
| `getJSON`        |                  –                  | Get the current content as JSON.                                                                                                                                                                                                              |
| `getHTML`        |                  –                  | Get the current content as HTML.                                                                                                                                                                                                              |
| `focus`          |                  –                  | Focus the editor.                                                                                                                                                                                                                             |
| `blur`           |                  –                  | Blur the editor.                                                                                                                                                                                                                              |
| `destroy`        |                  –                  | Destroy the editor.                                                                                                                                                                                                                           |

## Components

| **Name**                   | **Description**                        |
| -------------------------- | -------------------------------------- |
| `<editor-content />`       | Here the content will be rendered.     |
| `<editor-menu-bar />`      | Here a menu bar will be rendered.      |
| `<editor-menu-bubble />`   | Here a menu bubble will be rendered.   |
| `<editor-floating-menu />` | Here a floating menu will be rendered. |

### EditorMenuBar

The `<editor-menu-bar />` component is renderless and will receive some properties through a scoped slot.

| **Property**   |  **Type**  | **Description**                                                                                        |
| -------------- | :--------: | ------------------------------------------------------------------------------------------------------ |
| `commands`     |  `Array`   | A list of all commands.                                                                                |
| `isActive`     |  `Object`  | An object of functions to check if your selected text is a node or mark. `isActive.{node|mark}(attrs)` |
| `getMarkAttrs` | `Function` | A function to get all mark attributes of your selection.                                               |
| `getNodeAttrs` | `Function` | A function to get all node attributes of your selection.                                               |
| `focused`      | `Boolean`  | Whether the editor is focused.                                                                         |
| `focus`        | `Function` | A function to focus the editor.                                                                        |

#### Example

```vue
<template>
  <editor-menu-bar :editor="editor" v-slot="{ commands, isActive }">
    <div>
      <button :class="{ 'is-active': isActive.bold() }" @click="commands.bold">
        Bold
      </button>
      <button :class="{ 'is-active': isActive.heading({ level: 2 }) }" @click="commands.heading({ level: 2 })">
        H2
      </button>
    </div>
  </editor-menu-bar>
</template>
```

### EditorMenuBubble

The `<editor-menu-bubble />` component is renderless and will receive some properties through a scoped slot.

| **Property**   |  **Type**  | **Description**                                                                                        |
| -------------- | :--------: | ------------------------------------------------------------------------------------------------------ |
| `commands`     |  `Array`   | A list of all commands.                                                                                |
| `isActive`     |  `Object`  | An object of functions to check if your selected text is a node or mark. `isActive.{node|mark}(attrs)` |
| `getMarkAttrs` | `Function` | A function to get all mark attributes of your selection.                                               |
| `getNodeAttrs` | `Function` | A function to get all node attributes of your selection.                                               |
| `focused`      | `Boolean`  | Whether the editor is focused.                                                                         |
| `focus`        | `Function` | A function to focus the editor.                                                                        |
| `menu`         |  `Object`  | An object for positioning your menu.                                                                   |

#### Example

```vue
<template>
  <editor-menu-bubble :editor="editor" v-slot="{ commands, isActive, menu }">
    <div
      :class="{ 'is-active': menu.isActive }"
      :style="`left: ${menu.left}px; bottom: ${menu.bottom}px;`"
    >
      <button :class="{ 'is-active': isActive.bold() }" @click="commands.bold">
        Bold
      </button>
      <button :class="{ 'is-active': isActive.heading({ level: 2 }) }" @click="commands.heading({ level: 2 })">
        H2
      </button>
    </div>
  </editor-menu-bubble>
</template>
```

### EditorFloatingMenu

The `<editor-floating-menu />` component is renderless and will receive some properties through a scoped slot.

| **Property**   |  **Type**  | **Description**                                                                                        |
| -------------- | :--------: | ------------------------------------------------------------------------------------------------------ |
| `commands`     |  `Array`   | A list of all commands.                                                                                |
| `isActive`     |  `Object`  | An object of functions to check if your selected text is a node or mark. `isActive.{node|mark}(attrs)` |
| `getMarkAttrs` | `Function` | A function to get all mark attributes of your selection.                                               |
| `getNodeAttrs` | `Function` | A function to get all node attributes of your selection.                                               |
| `focused`      | `Boolean`  | Whether the editor is focused.                                                                         |
| `focus`        | `Function` | A function to focus the editor.                                                                        |
| `menu`         |  `Object`  | An object for positioning your menu.                                                                   |

#### Example

```vue
<template>
  <editor-floating-menu :editor="editor" v-slot="{ commands, isActive, menu }">
    <div
      :class="{ 'is-active': menu.isActive }"
      :style="`top: ${menu.top}px`"
    >
      <button :class="{ 'is-active': isActive.bold() }" @click="commands.bold">
        Bold
      </button>
      <button :class="{ 'is-active': isActive.heading({ level: 2 }) }" @click="commands.heading({ level: 2 })">
        H2
      </button>
    </div>
  </editor-floating-menu>
</template>
```

## Extensions

By default, the editor will only support paragraphs. Other nodes and marks are available as **extensions**. There is a package called `tiptap-extensions` with the most basic nodes, marks, and plugins.

### Available Extensions

```vue
<template>
  <div>
    <editor-menu-bar :editor="editor" v-slot="{ commands, isActive }">
        <button :class="{ 'is-active': isActive.bold() }" @click="commands.bold">
          Bold
        </button>
    </editor-menu-bar>
    <editor-content :editor="editor" />
  </div>
</template>

<script>
import { Editor, EditorContent, EditorMenuBar } from 'tiptap'
import {
  Blockquote,
  CodeBlock,
  HardBreak,
  Heading,
  OrderedList,
  BulletList,
  ListItem,
  TodoItem,
  TodoList,
  Bold,
  Code,
  Italic,
  Link,
  Strike,
  Underline,
  History,
} from 'tiptap-extensions'

export default {
  components: {
    EditorMenuBar,
    EditorContent,
  },
  data() {
    return {
      editor: new Editor({
        extensions: [
          new Blockquote(),
          new CodeBlock(),
          new HardBreak(),
          new Heading({ levels: [1, 2, 3] }),
          new BulletList(),
          new OrderedList(),
          new ListItem(),
          new TodoItem(),
          new TodoList(),
          new Bold(),
          new Code(),
          new Italic(),
          new Link(),
          new Strike(),
          new Underline(),
          new History(),
        ],
        content: `
          <h1>Yay Headlines!</h1>
          <p>All these <strong>cool tags</strong> are working now.</p>
        `,
      }),
    }
  },
  beforeDestroy() {
    this.editor.destroy()
  },
}
</script>
```

### Create Custom Extensions

The most powerful feature of tiptap is that you can create your own extensions. There are 3 types of extensions.

| **Type**    | **Description**                                                                                                                   |
| ----------- | --------------------------------------------------------------------------------------------------------------------------------- |
| `Extension` | The most basic type. It's useful to register some [Prosemirror plugins](https://prosemirror.net/docs/guide/) or some input rules. |
| `Node`      | Add a custom node. Nodes are block elements like a headline or a paragraph.                                                       |
| `Mark`      | Add a custom mark. Marks are used to add extra styling or other information to inline content like a strong tag or links.         |

### Extension Class

| **Method**                    |  **Type**  | **Default** | **Description**                                                              |
| ----------------------------- | :--------: | :---------: | ---------------------------------------------------------------------------- |
| `get name()`                  |  `String`  |   `null`    | Define a name for your extension.                                            |
| `get defaultOptions()`        |  `Object`  |    `{}`     | Define some default options. The options are available as `this.$options`.   |
| `get plugins()`               |  `Array`   |    `[]`     | Define a list of [Prosemirror plugins](https://prosemirror.net/docs/guide/). |
| `keys({ schema })`            |  `Object`  |   `null`    | Define some keybindings.                                                     |
| `commands({ schema, attrs })` |  `Object`  |   `null`    | Define a command.                                                            |
| `inputRules({ schema })`      |  `Array`   |    `[]`     | Define a list of input rules.                                                |
| `pasteRules({ schema })`      |  `Array`   |    `[]`     | Define a list of paste rules.                                                |
| `get update()`                | `Function` | `undefined` | Called when options of extension are changed via `editor.extensions.options` |

### Node|Mark Class

| **Method**                          | **Type** | **Default** | **Description**                                                                       |
| ----------------------------------- | :------: | :---------: | ------------------------------------------------------------------------------------- |
| `get name()`                        | `String` |   `null`    | Define a name for your node or mark.                                                  |
| `get defaultOptions()`              | `Object` |    `{}`     | Define some default options. The options are available as `this.$options`.            |
| `get schema()`                      | `Object` |   `null`    | Define a [schema](https://prosemirror.net/docs/guide/#schema).                        |
| `get view()`                        | `Object` |   `null`    | Define a node view as a vue component.                                                |
| `keys({ type, schema })`            | `Object` |   `null`    | Define some keybindings.                                                              |
| `commands({ type, schema, attrs })` | `Object` |   `null`    | Define a command. For example this is used for menus to convert to this node or mark. |
| `inputRules({ type, schema })`      | `Array`  |    `[]`     | Define a list of input rules.                                                         |
| `pasteRules({ type, schema })`      | `Array`  |    `[]`     | Define a list of paste rules.                                                         |
| `get plugins()`                     | `Array`  |    `[]`     | Define a list of [Prosemirror plugins](https://prosemirror.net/docs/guide/).          |

### Create a Node

Let's take a look at a real example. This is basically how the default `blockquote` node from [`tiptap-extensions`](https://www.npmjs.com/package/tiptap-extensions) looks like.

```js
import { Node } from 'tiptap'
import { wrappingInputRule, setBlockType, toggleWrap } from 'tiptap-commands'

export default class BlockquoteNode extends Node {

  // choose a unique name
  get name() {
    return 'blockquote'
  }

  // the prosemirror schema object
  // take a look at https://prosemirror.net/docs/guide/#schema for a detailed explanation
  get schema() {
    return {
      content: 'block+',
      group: 'block',
      defining: true,
      draggable: false,
      // define how the editor will detect your node from pasted HTML
      // every blockquote tag will be converted to this blockquote node
      parseDOM: [
        { tag: 'blockquote' },
      ],
      // this is how this node will be rendered
      // in this case a blockquote tag with a class called `awesome-blockquote` will be rendered
      // the '0' stands for its text content inside
      toDOM: () => ['blockquote', { class: 'awesome-blockquote' }, 0],
    }
  }

  // this command will be called from menus to add a blockquote
  // `type` is the prosemirror schema object for this blockquote
  // `schema` is a collection of all registered nodes and marks
  commands({ type, schema }) {
    return () => toggleWrap(type)
  }

  // here you can register some shortcuts
  // in this case you can create a blockquote with `ctrl` + `>`
  keys({ type }) {
    return {
      'Ctrl->': toggleWrap(type),
    }
  }

  // a blockquote will be created when you are on a new line and type `>` followed by a space
  inputRules({ type }) {
    return [
      wrappingInputRule(/^\s*>\s$/, type),
    ]
  }

}
```

### Create a Node as a Vue Component

The real power of the nodes comes in combination with Vue components. Let us build an iframe node, where you can change its URL (this can also be found in our [examples](https://github.com/ueberdosis/tiptap/tree/main/examples/Components/Routes/Embeds)).

```js
import { Node } from 'tiptap'

export default class IframeNode extends Node {

  get name() {
    return 'iframe'
  }

  get schema() {
    return {
      // here you have to specify all values that can be stored in this node
      attrs: {
        src: {
          default: null,
        },
      },
      group: 'block',
      selectable: false,
      // parseDOM and toDOM is still required to make copy and paste work
      parseDOM: [{
        tag: 'iframe',
        getAttrs: dom => ({
          src: dom.getAttribute('src'),
        }),
      }],
      toDOM: node => ['iframe', {
        src: node.attrs.src,
        frameborder: 0,
        allowfullscreen: 'true',
      }],
    }
  }

  // return a vue component
  // this can be an object or an imported component
  get view() {
    return {
      // there are some props available
      // `node` is a Prosemirror Node Object
      // `updateAttrs` is a function to update attributes defined in `schema`
      // `view` is the ProseMirror view instance
      // `options` is an array of your extension options
      // `selected` is a boolean which is true when selected
      // `editor` is a reference to the TipTap editor instance
      // `getPos` is a function to retrieve the start position of the node
      // `decorations` is an array of decorations around the node
      props: ['node', 'updateAttrs', 'view'],
      computed: {
        src: {
          get() {
            return this.node.attrs.src
          },
          set(src) {
            // we cannot update `src` itself because `this.node.attrs` is immutable
            this.updateAttrs({
              src,
            })
          },
        },
      },
      template: `
        <div class="iframe">
          <iframe class="iframe__embed" :src="src"></iframe>
          <input class="iframe__input" type="text" v-model="src" v-if="view.editable" />
        </div>
      `,
    }
  }

}
```

#### NodeView Prop Types

| **Prop**      |  **Type**  | **Description**                                                                                                                                                                                         |
| ------------- | :--------: | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `node`        |  `Object`  | The Prosemirror node object. Common use case is to get `node.attrs` using a getter on a computed property.                                                                                              |
| `updateAttrs` | `Function` | A function to update `node.attrs` defined in `schema`. Common use case is as setter on a computed property.                                                                                             |
| `view`        |  `Object`  | The Prosemirror editor view instance.                                                                                                                                                                   |
| `options`     |  `Array`   | An array of your extension options.                                                                                                                                                                     |
| `getPos`      | `Function` | A function that returns the anchored position of the node.                                                                                                                                              |
| `selected`    | `Boolean`  | A boolean that is set when the node is or is not selected. Common use case is using `watch` to see when the view is selected/unselected to do something, such focus an `<input>` or refocus the editor. |

## Collaborative editing

Collaborative editing is a complex topic. Luckily, @naept wrote an article about [collaborative editing with tiptap](https://medium.com/@julien.aupart/easy-collaborative-editor-with-tiptap-and-prosemirror-baa3314636c6?sk=fd25b326cc148b43a0e0a46e584f40c2) and also published two helpful repositories:

* [tiptap-collab-server](https://github.com/naept/tiptap-collab-server) by @naept
* [tiptap-extension-collaboration](https://github.com/naept/tiptap-extension-collaboration) by @naept

## Browser Support

| ![Chrome](https://raw.githubusercontent.com/alrra/browser-logos/master/src/chrome/chrome_48x48.png) | ![Firefox](https://raw.githubusercontent.com/alrra/browser-logos/master/src/firefox/firefox_48x48.png) | ![IE](https://raw.githubusercontent.com/alrra/browser-logos/master/src/edge/edge_48x48.png) | ![Opera](https://raw.githubusercontent.com/alrra/browser-logos/master/src/opera/opera_48x48.png) | ![Safari](https://raw.githubusercontent.com/alrra/browser-logos/master/src/safari/safari_48x48.png) |
| --------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------- |
| Last 2 Versions ✔                                                                                   | Last 2 Versions ✔                                                                                      | Last 2 Versions ✔                                                                           | Last 2 Versions ✔                                                                                | Last 2 Versions ✔                                                                                   |

## Development Setup

Currently, only Yarn is supported for development because of a feature called workspaces we are using here.

``` bash
# install dependencies
yarn install

# serve examples at localhost:3000
yarn start

# build dist files for packages
yarn build:packages

# build dist files for examples
yarn build:examples
```

## Contribute using the online one-click setup

You can use Gitpod(a free online VS Code-like IDE) for contributing. With a single click, it will launch a workspace and automatically:

- clone the `tiptap` repo.
- install the dependencies.
- run `yarn run start`.

So that anyone interested in contributing can start straight away.

[![Open in Gitpod](https://gitpod.io/button/open-in-gitpod.svg)](https://gitpod.io/#https://github.com/ueberdosis/tiptap/)

## Contributing

Please see [CONTRIBUTING](CONTRIBUTING.md) for details.

## Credits

- [Philipp Kühn](https://github.com/philippkuehn)
- [Hans Pagel](https://github.com/hanspagel)
- [Christoph Flathmann](https://github.com/Chrissi2812)
- [Erick Wilder](https://github.com/erickwilder)
- [Marius Tolzmann](https://github.com/mariux)
- [All Contributors](../../contributors)

## Related projects

- [html-to-prosemirror](https://github.com/ueberdosis/html-to-prosemirror) by @hanspagel
- [prosemirror-to-html](https://github.com/ueberdosis/prosemirror-to-html) by @hanspagel
- [tiptap-svelte](https://github.com/andrewjk/tiptap-svelte) by @andrewjk
- [Laravel Nova Tiptap Editor Field](https://github.com/manogi/nova-tiptap) by @manogi
- [WYSIWYG editor for Vuetify](https://github.com/iliyaZelenko/tiptap-vuetify) by @iliyaZelenko
- [Quasar Tiptap Demo](https://github.com/kfields/quasar-tiptap-demo) @kfields
- [Python Library that converts tiptap JSON](https://github.com/scrolltech/tiptapy) @scrolltech
- [WYSIWYG editor for Element UI](https://github.com/Leecason/element-tiptap) by @Leecason
- [WYSIWYG editor for Quasar Framework](https://github.com/donotebase/quasar-tiptap) by @mekery

## Love our work?
[Sponsor us](https://github.com/sponsors/ueberdosis) ❤️

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.
