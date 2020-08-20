# Blockquote
The Blockquote extension enables you to use the `<blockquote>` HTML tag in the editor.

## Options
*None*

## Commands
| Command | Options | Description |
| ------ | ---- | ---------------- |
| blockquote | — | Wrap content in a blockquote. |

## Keybindings
* `Control` + `→`

## Usage
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