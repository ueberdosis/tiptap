# History
Enables history support.

#### Commands
| command | options | description |
| ------ | ---- | ---------------- |
| undo | none | Undo the latest change. |
| redo | none | Redo the latest change. |

#### Keybindings
* Windows & Linux: `Control` + `Z` → Undo
* Windows & Linux: `Shift` + `Control` + `Z` → Redo
* macOS: `Command` + `Z` → Undo
* macOS: `Shift` + `Command` + `Z` → Redo

#### Example
```markup
<template>
  <div>
    <editor-menu-bar :editor="editor" v-slot="{ commands, isActive }">
      <div>
        <button type="button" @click="commands.undo">
          Undo
        </button>
        <button type="button" @click="commands.redo">
          Redo
        </button>
      </div>
    </editor-menu-bar>

    <editor-content :editor="editor" />
  </div>
</template>

<script>
import { Editor, EditorContent, EditorMenuBar } from 'tiptap'
import { History } from 'tiptap-extensions'

export default {
  components: {
    EditorMenuBar,
    EditorContent,
  },
  data() {
    return {
      editor: new Editor({
        extensions: [
          new History(),
        ],
      }),
    }
  },
  beforeDestroy() {
    this.editor.destroy()
  }
}
</script>
```