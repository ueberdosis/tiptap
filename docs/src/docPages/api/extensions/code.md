# Code
The Code extensions enables you to use the `<code>` HTML tag in the editor.

## Options
*None*

## Commands
| Command | Options | Description |
| ------ | ---- | ---------------- |
| code | none | Mark text as code. |

## Keybindings
* `Alt` + `

## Usage
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