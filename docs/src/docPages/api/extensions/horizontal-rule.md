# HorizontalRule
Use this extension to render a `<hr>` HTML tag. If you pass `<hr>` in the editor’s initial content, it’ll be rendered accordingly.

Type `---` (three dashes) or `___ ` (three underscores and a space) at the beginning of a new line and it will be magically transformed to a horizontal rule.

## Options
| Option | Type   | Default | Description                                  |
| ------ | ------ | ------- | -------------------------------------------- |
| class  | string | –       | Add a custom class to the rendered HTML tag. |

## Commands
| Command         | Options | Description               |
| --------------- | ------- | ------------------------- |
| horizontalRule | —       | Create a horizontal rule. |

## Keyboard shortcuts
*None*

## Source Code
[packages/extension-horizontal-rule/](https://github.com/ueberdosis/tiptap-next/blob/main/packages/extension-horizontal-rule/)

## Usage
<demo name="Extensions/HorizontalRule" highlight="3-5,17,36" />

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
          HorizontalRule(),
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