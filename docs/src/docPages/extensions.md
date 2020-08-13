# Extensions

> ⚠️ TODO: This is old content.

By default, the editor will only support paragraphs. Other nodes and marks are available as **extensions**. You must
install `tiptap-extensions` package separately so that you can use basic Nodes, Marks, or Plugins. An extension is
usually tied to a Command. The official set of commands are part of the
[`tiptap-commands`][@npmjs-tiptap-commands] package.

## Blockquote
Allows you to use the `<blockquote>` HTML tag in the editor.

#### Options
*None*

#### Commands
| command | options | description |
| ------ | ---- | ---------------- |
| blockquote | none | Wrap content in a blockquote. |

#### Keybindings
* `Control` + `→`

#### Example
```markup
<template>
  <div>
    <editor-menu-bar :editor="editor" v-slot="{ commands, isActive }">
      <button type="button" :class="{ 'is-active': isActive.blockquote() }" @click="commands.blockquote">
        Blockquote
      </button>
    </editor-menu-bar>

    <editor-content :editor="editor" />
  </div>
</template>

<script>
import { Editor, EditorContent, EditorMenuBar } from 'tiptap'
import { Blockquote } from 'tiptap-extensions'

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
        ],
        content: `
          <blockquote>
            Life is like riding a bycicle. To keep your balance, you must keep moving.
          </blockquote>
          <p>Albert Einstein</p>
        `,
      }),
    }
  },
  beforeDestroy() {
    this.editor.destroy()
  }
}
</script>
```

## Bold
Renders text in **bold** text weight. If you pass `<strong>`, or `<b>` tags, or text with inline `style` attributes setting the `font-weight` CSS rule in the editor's initial content, they will be rendered accordingly.

::: warning Restrictions
The extension will generate the corresponding `<strong>` HTML tags when reading contents of the `Editor` instance. All text marked as bold, regardless of method will be normalized to `<strong>` HTML tags.
:::

#### Options
*None*

#### Commands
| command | options | description |
| ------ | ---- | ---------------- |
| bold | none | Mark text as bold. |

#### Keybindings
* Windows & Linux: `Control` + `B`
* macOS: `Command` + `B`

#### Example

```markup
<template>
  <div>
    <editor-menu-bar :editor="editor" v-slot="{ commands, isActive }">
      <button type="button" :class="{ 'is-active': isActive.bold() }" @click="commands.bold">
        Bold
      </button>
    </editor-menu-bar>

    <editor-content :editor="editor" />
  </div>
</template>

<script>
import { Editor, EditorContent, EditorMenuBar } from 'tiptap'
import { Bold } from 'tiptap-extensions'

export default {
  components: {
    EditorMenuBar,
    EditorContent,
  },
  data() {
    return {
      editor: new Editor({
        extensions: [
          new Bold(),
        ],
        content: `
          <p><strong>This is strong</strong></p>
          <p><b>And this</b></p>
          <p style="font-weight: bold">This as well</p>
          <p style="font-weight: bolder">Oh! and this</p>
          <p style="font-weight: 500">Cool! Right!?</p>
          <p style="font-weight: 999">Up to 999!!!</p>
        `,
      }),
    }
  },
  beforeDestroy() {
    this.editor.destroy()
  }
}
</script>
```

## BulletList
Allows you to use the `<ul>` HTML tag in the editor.

::: warning Restrictions
This extensions is intended to be used with the `ListItem` extension.
:::

#### Options
*None*

#### Commands
| command | options | description |
| ------ | ---- | ---------------- |
| bullet_list | none | Toggle a bullet list. |

#### Keybindings
* `Control` + `Shift` + `8`

#### Example

```markup
<template>
  <div>
    <editor-menu-bar :editor="editor" v-slot="{ commands, isActive }">
      <button type="button" :class="{ 'is-active': isActive.bullet_list() }" @click="commands.bullet_list">
        Bullet List
      </button>
    </editor-menu-bar>

    <editor-content :editor="editor" />
  </div>
</template>

<script>
import { Editor, EditorContent, EditorMenuBar } from 'tiptap'
import { BulletList } from 'tiptap-extensions'

export default {
  components: {
    EditorMenuBar,
    EditorContent,
  },
  data() {
    return {
      editor: new Editor({
        extensions: [
          new BulletList(),
        ],
        content: `
          <ul>
            <li>A list item</li>
            <li>And another one</li>
          </ul>
        `,
      }),
    }
  },
  beforeDestroy() {
    this.editor.destroy()
  }
}
</script>
```

## Code
Allows you to use the `<code>` HTML tag in the editor.

#### Options
*None*

#### Commands
| command | options | description |
| ------ | ---- | ---------------- |
| code | none | Mark text as code. |

#### Keybindings
* `Alt` + `

#### Example
```markup
<template>
  <div>
    <editor-menu-bar :editor="editor" v-slot="{ commands, isActive }">
      <button type="button" :class="{ 'is-active': isActive.code() }" @click="commands.code">
        Code
      </button>
    </editor-menu-bar>

    <editor-content :editor="editor" />
  </div>
</template>

<script>
import { Editor, EditorContent, EditorMenuBar } from 'tiptap'
import { Code } from 'tiptap-extensions'

export default {
  components: {
    EditorMenuBar,
    EditorContent,
  },
  data() {
    return {
      editor: new Editor({
        extensions: [
          new Code(),
        ],
        content: `
          <p>This is some <code>inline code.</code></p>
        `,
      }),
    }
  },
  beforeDestroy() {
    this.editor.destroy()
  }
}
</script>
```

## CodeBlock
Allows you to use the `<pre>` HTML tag in the editor.

## CodeBlockHighlight
Allows you to use the `<pre>` HTML tag with auto-detected syntax highlighting in the editor.

## Collaboration
Allows you to collaborate with others on one document.

## HardBreak
Allows you to use the `<br>` HTML tag in the editor.

#### Options
*None*

#### Keybindings
* New CodeBlock: `Shift` + `Enter` + `
* Leave CodeBlock: `Command` + `Enter`

## Heading
Allows you to use the headline HTML tags in the editor.

#### Options
| option | type | default | description |
| ------ | ---- | ---- | ----- |
| levels | Array | [1, 2, 3, 4, 5, 6] | Specifies which headlines are to be supported. |

#### Commands
| command | options | description |
| ------ | ---- | ---------------- |
| heading | level | Creates a heading node. |

#### Keybindings
* `Control` + `Shift` + `1` → H1
* `Control` + `Shift` + `2` → H2
* `Control` + `Shift` + `3` → H3
* `Control` + `Shift` + `4` → H4
* `Control` + `Shift` + `5` → H5
* `Control` + `Shift` + `6` → H6

#### Example
```markup
<template>
  <div>
    <editor-menu-bar :editor="editor" v-slot="{ commands, isActive }">
      <div>
        <button type="button" :class="{ 'is-active': isActive.heading({ level: 1 }) }" @click="commands.heading({ level: 1})">
          H1
        </button>
        <button type="button" :class="{ 'is-active': isActive.heading({ level: 2 }) }" @click="commands.heading({ level: 2 })">
          H2
        </button>
      </div>
    </editor-menu-bar>

    <editor-content :editor="editor" />
  </div>
</template>

<script>
import { Editor, EditorContent, EditorMenuBar } from 'tiptap'
import { Heading } from 'tiptap-extensions'

export default {
  components: {
    EditorMenuBar,
    EditorContent,
  },
  data() {
    return {
      editor: new Editor({
        extensions: [
          new Heading({
            levels: [1, 2],
          }),
        ],
        content: `
          <h1>This is a headline level 1</h1>
          <h2>This is a headline level 2</h2>
          <h3>This headline will be converted to a paragraph, because it's not defined in the levels option.</h3>
        `,
      }),
    }
  },
  beforeDestroy() {
    this.editor.destroy()
  }
}
</script>
```

## History
Enables history support.

#### Commands
| command | options | description |
| ------ | ---- | ---------------- |
| undo | none | Undo the latest change. |
| redo | none | Redo the latest change. |

#### Keybindings
* Windows & Linux: `Control` + `Z` → Undo
* Windows & Linux: `Shift` + `Control` + `Z` → Redo
* macOS: `Command` + `Z` → Undo
* macOS: `Shift` + `Command` + `Z` → Redo

#### Example
```markup
<template>
  <div>
    <editor-menu-bar :editor="editor" v-slot="{ commands, isActive }">
      <div>
        <button type="button" @click="commands.undo">
          Undo
        </button>
        <button type="button" @click="commands.redo">
          Redo
        </button>
      </div>
    </editor-menu-bar>

    <editor-content :editor="editor" />
  </div>
</template>

<script>
import { Editor, EditorContent, EditorMenuBar } from 'tiptap'
import { History } from 'tiptap-extensions'

export default {
  components: {
    EditorMenuBar,
    EditorContent,
  },
  data() {
    return {
      editor: new Editor({
        extensions: [
          new History(),
        ],
      }),
    }
  },
  beforeDestroy() {
    this.editor.destroy()
  }
}
</script>
```

## HorizontalRule
Allows you to use the `<hr>` HTML tag in the editor.

#### Options
*None*

#### Commands
| command | options | description |
| ------ | ---- | ---------------- |
| horizontal_rule | none | Create a horizontal rule. |

#### Keybindings
*None*

#### Example
```markup
<template>
  <div>
    <editor-menu-bar :editor="editor" v-slot="{ commands, isActive }">
      <button type="button" @click="commands.horizontal_rule">
        Horizontal Rule
      </button>
    </editor-menu-bar>

    <editor-content :editor="editor" />
  </div>
</template>

<script>
import { Editor, EditorContent, EditorMenuBar } from 'tiptap'
import { HorizontalRule } from 'tiptap-extensions'

export default {
  components: {
    EditorMenuBar,
    EditorContent,
  },
  data() {
    return {
      editor: new Editor({
        extensions: [
          new HorizontalRule(),
        ],
        content: `
          <p>Some text.</p>
          <hr />
          <p>Text again.</p>
        `,
      }),
    }
  },
  beforeDestroy() {
    this.editor.destroy()
  }
}
</script>
```

## Italic
Allows you to use the `<em>` HTML tag in the editor.

#### Options
*None*

#### Commands
| command | options | description |
| ------ | ---- | ---------------- |
| italic | none | Mark text as italic. |

#### Keybindings
* Windows & Linux: `Control` + `I`
* macOS: `Command` + `I`

#### Example
```markup
<template>
  <div>
    <editor-menu-bar :editor="editor" v-slot="{ commands, isActive }">
      <button type="button" :class="{ 'is-active': isActive.italic() }" @click="commands.italic">
        Italic
      </button>
    </editor-menu-bar>

    <editor-content :editor="editor" />
  </div>
</template>

<script>
import { Editor, EditorContent, EditorMenuBar } from 'tiptap'
import { Italic } from 'tiptap-extensions'

export default {
  components: {
    EditorMenuBar,
    EditorContent,
  },
  data() {
    return {
      editor: new Editor({
        extensions: [
          new Italic(),
        ],
        content: `
          <p><em>This is italic</em></p>
          <p><i>And this</i></p>
          <p style="font-style: italic">This as well</p>
        `,
      }),
    }
  },
  beforeDestroy() {
    this.editor.destroy()
  }
}
</script>
```

## Link
Allows you to use the `<a>` HTML tag in the editor.
#### Options
| option | type | default | description |
| ------ | ---- | ---- | ----- |
| openOnClick | Boolean | true | Specifies if links will be opened on click. |

## ListItem
Allows you to use the `<li>` HTML tag in the editor.

::: warning Restrictions
This extensions is intended to be used with the `BulletList` or `OrderedList` extension.
:::

## Mention
Allows you to use mentions in the editor.

## OrderedList
Allows you to use the `<ol>` HTML tag in the editor.

::: warning Restrictions
This extensions is intended to be used with the `ListItem` extension.
:::

#### Options
*None*

#### Commands
| command | options | description |
| ------ | ---- | ---------------- |
| ordered_list | none | Toggle an ordered list. |

#### Keybindings
* `Control` + `Shift` + `9`

#### Example
```markup
<template>
  <div>
    <editor-menu-bar :editor="editor" v-slot="{ commands, isActive }">
      <button type="button" :class="{ 'is-active': isActive.ordered_list() }" @click="commands.ordered_list">
        Ordered List
      </button>
    </editor-menu-bar>

    <editor-content :editor="editor" />
  </div>
</template>

<script>
import { Editor, EditorContent, EditorMenuBar } from 'tiptap'
import { OrderedList } from 'tiptap-extensions'

export default {
  components: {
    EditorMenuBar,
    EditorContent,
  },
  data() {
    return {
      editor: new Editor({
        extensions: [
          new OrderedList(),
        ],
        content: `
          <ol>
            <li>A list item</li>
            <li>And another one</li>
          </ol>
          <ol start="3">
            <li>This list begins with 3.</li>
          </ol>
        `,
      }),
    }
  },
  beforeDestroy() {
    this.editor.destroy()
  }
}
</script>
```

## Placeholder
Allows you to show placeholders on empty paragraphs.

## Table
This enables support for tables in your editor.
Tables can be nested and allow all blocks to be used inside.
Each `<TableCell>` includes a single `<Paragraph>`.

#### Options
| option | type | default | description |
| ------ | ---- | ---- | ----- |
| resizable | Boolean | false | Enables the resizing of columns |

#### Keybindings
* `Tab` → Next Cell
* `Shift` + `Tab` + ` → Previous Cell

#### Commands
| command | options | description |
| ------ | ---- | ---------------- |
| createTable | ```{ rowsCount, colsCount, withHeaderRow }``` | Returns a table node of a given size. `withHeaderRow` defines whether the first row of the table will be a header row. |
| deleteTable | none | Deletes the complete table which is active |
| addColumnBefore | none | Add a column before the selection. |
| addColumnAfter | none | Add a column after the selection. |
| deleteColumn | none | Removes the selected columns. |
| addRowBefore | none | Add a table row before the selection. |
| addRowAfter | none | Add a table row after the selection. |
| toggleCellMerge | none | See mergeCells and splitCells |
| mergeCells | none | Merge the selected cells into a single cell. Only available when the selected cells' outline forms a rectangle. |
| splitCell | none | Split a selected cell, whose rowspan or colspan is greater than one into smaller cells. |
| toggleHeaderColumn | none | Toggles whether the selected column contains header cells. |
| toggleHeaderRow | none | Toggles whether the selected row contains header cells. |
| toggleHeaderCell | none | Toggles whether the selected column contains header cells. |
| setCellAttr | none | Returns a command that sets the given attribute to the given value, and is only available when the currently selected cell doesn't already have that attribute set to that value. |
| fixTables | none | Inspect all tables in the given state's document and return a transaction that fixes them, if necessary. |

#### Example
::: warning
You have to include all table extensions (`TableHeader`, `TableCell` & `TableRow`)
:::

```markup
  <template>
    <div>
      <editor-menu-bar :editor="editor" v-slot="{ commands, isActive }">
        <button :class="{ 'is-active': isActive.bold() }" @click="commands.createTable({rowsCount: 3, colsCount: 3, withHeaderRow: false })">
          Create Table
        </button>
      </editor-menu-bar>

      <editor-content :editor="editor" />
    </div>
  </template>

  <script>
  import { Editor, EditorContent, EditorMenuBar } from 'tiptap'
  import { Table, TableCell, TableHeader, TableRow } from 'tiptap-extensions'


  export default {
    components: {
        EditorMenuBar,
        EditorContent,
    },
    data() {
      return {
        editor: new Editor({
          extensions: [
            new Table(),
            new TableCell(),
            new TableHeader(),
            new TableRow(),
          ],
          content: ''
        }),
      }
    },
    beforeDestroy() {
      this.editor.destroy()
    }
  }
  </script>
```

## TableHeader
Allows you to use the `<th>` HTML tag in the editor.

::: warning Restrictions
This extensions is intended to be used with the `Table` extension.
:::

## TableCell
Allows you to use the `<td>` HTML tag in the editor.

::: warning Restrictions
This extensions is intended to be used with the `Table` extension.
:::

## TableRow
Allows you to use the `<tr>` HTML tag in the editor.

::: warning Restrictions
This extensions is intended to be used with the `Table` extension.
:::

## TodoItem
It renders a single toggleable item of a list.

::: warning Restrictions
This extensions is intended to be used with the `TodoList` extension.
:::

#### Options
| option | type | default | description |
| ------ | ---- | ---- | ----- |
| nested | Boolean | false | Specifies if you can nest todo lists. |

#### Commands
*None*

#### Keybindings
*None*

## TodoList
Renders a toggleable list of items.

::: warning Restrictions
This extensions is intended to be used with the `TodoItem` extension.
:::

#### Options
*None*

#### Commands
| command | options | description |
| ------ | ---- | ---------------- |
| todo_list | none | Toggle todo list. |

#### Keybindings
*None*

#### Example
```markup
<template>
  <div>
    <editor-menu-bar :editor="editor" v-slot="{ commands, isActive }">
      <button type="button" :class="{ 'is-active': isActive.todo_list() }" @click="commands.todo_list">
        Todo List
      </button>
    </editor-menu-bar>

    <editor-content :editor="editor" />
  </div>
</template>

<script>
import { Editor, EditorContent, EditorMenuBar } from 'tiptap'
import { TodoItem, TodoList } from 'tiptap-extensions'

export default {
  components: {
    EditorMenuBar,
    EditorContent,
  },
  data() {
    return {
      editor: new Editor({
        extensions: [
          new TodoItem({
            nested: true,
          }),
          new TodoList(),
        ],
        content: `
          <ul data-type="todo_list">
            <li data-type="todo_item" data-done="true">
              Checked item
            </li>
            <li data-type="todo_item" data-done="false">
              Unchecked item
            </li>
          </ul>
        `,
      }),
    }
  },
  beforeDestroy() {
    this.editor.destroy()
  }
}
</script>
```

## Strike
Allows you to use the `<s>` HTML tag in the editor.

#### Options
*None*

#### Commands
| command | options | description |
| ------ | ---- | ---------------- |
| strike | none | Mark text as strikethrough. |

#### Keybindings
* Windows & Linux: `Control` + `D`
* macOS: `Command` + `D`

#### Example

```markup
<template>
  <div>
    <editor-menu-bar :editor="editor" v-slot="{ commands, isActive }">
      <button type="button" :class="{ 'is-active': isActive.strike() }" @click="commands.strike">
        Strike
      </button>
    </editor-menu-bar>

    <editor-content :editor="editor" />
  </div>
</template>

<script>
import { Editor, EditorContent, EditorMenuBar } from 'tiptap'
import { Strike } from 'tiptap-extensions'

export default {
  components: {
    EditorMenuBar,
    EditorContent,
  },
  data() {
    return {
      editor: new Editor({
        extensions: [
          new Strike(),
        ],
        content: `
          <p><s>That's strikethrough.</s></p>
          <p><del>This too.</del></p>
          <p><strike>And this.</strike></p>
          <p style="text-decoration: line-through">This as well.</p>
        `,
      }),
    }
  },
  beforeDestroy() {
    this.editor.destroy()
  }
}
</script>
```

## Underline
Allows you to use the `<u>` HTML tag in the editor.

#### Options
*None*

#### Commands
| command | options | description |
| ------ | ---- | ---------------- |
| underline | none | Mark text as underlined. |

#### Keybindings
* Windows & Linux: `Control` + `U`
* macOS: `Command` + `U`

#### Example

```markup
<template>
  <div>
    <editor-menu-bar :editor="editor" v-slot="{ commands, isActive }">
      <button type="button" :class="{ 'is-active': isActive.underline() }" @click="commands.underline">
        Underline
      </button>
    </editor-menu-bar>

    <editor-content :editor="editor" />
  </div>
</template>

<script>
import { Editor, EditorContent, EditorMenuBar } from 'tiptap'
import { Underline } from 'tiptap-extensions'

export default {
  components: {
    EditorMenuBar,
    EditorContent,
  },
  data() {
    return {
      editor: new Editor({
        extensions: [
          new Underline(),
        ],
        content: `
          <p><u>This is underlined.</u></p>
          <p style="text-decoration: underline">This as well.</p>
        `,
      }),
    }
  },
  beforeDestroy() {
    this.editor.destroy()
  }
}
</script>
```

[@npmjs-tiptap-commands]: https://npmjs.org/package/tiptap-commands
