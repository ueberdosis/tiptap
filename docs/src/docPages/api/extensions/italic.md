# Italic
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