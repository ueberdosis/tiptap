# HorizontalRule
Enables you to use the `<hr>` HTML tag in the editor.

## Options
| Option | Type | Default | Description |
| ------ | ---- | ------- | ----------- |
| class | string | – | Add a custom class to the rendered HTML tag. |

## Commands
| Command | Options | Description |
| ------ | ---- | ---------------- |
| horizontal_rule | — | Create a horizontal rule. |

## Keybindings
*None*

## Usage
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