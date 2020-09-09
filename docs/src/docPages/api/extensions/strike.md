# Strike
Enables you to use the `<s>` HTML tag in the editor.

## Options
*None*

## Commands
| Command | Options | Description |
| ------ | ---- | ---------------- |
| strike | — | Mark text as strikethrough. |

## Keybindings
* Windows & Linux: `Control` + `D`
* macOS: `Command` + `D`

## Usage
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
          Strike(),
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