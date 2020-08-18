# OrderedList
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