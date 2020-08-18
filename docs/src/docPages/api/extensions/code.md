# Code
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