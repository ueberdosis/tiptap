# BulletList
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