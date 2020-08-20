# Bold
Renders text in **bold** text weight. If you pass `<strong>`, `<b>` tags, or text with inline `style` attributes setting the `font-weight` CSS rule in the editor’s initial content, they all will be rendered accordingly.

::: warning Restrictions
The extension will generate the corresponding `<strong>` HTML tags when reading contents of the `Editor` instance. All text marked as bold, regardless of the method will be normalized to `<strong>` HTML tags.
:::

## Options
*None*

## Commands
| Command | Options | Description |
| ------ | ---- | ---------------- |
| bold | none | Mark text as bold. |

## Keybindings
* Windows & Linux: `Control` + `B`
* macOS: `Command` + `B`

## Usage
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