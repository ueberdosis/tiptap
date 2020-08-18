# Heading
Allows you to use the headline HTML tags in the editor.

#### Options
| option | type | default | description |
| ------ | ---- | ---- | ----- |
| levels | Array | [1, 2, 3, 4, 5, 6] | Specifies which headlines are to be supported. |

#### Commands
| command | options | description |
| ------ | ---- | ---------------- |
| heading | level | Creates a heading node. |

#### Keybindings
* `Control` + `Shift` + `1` → H1
* `Control` + `Shift` + `2` → H2
* `Control` + `Shift` + `3` → H3
* `Control` + `Shift` + `4` → H4
* `Control` + `Shift` + `5` → H5
* `Control` + `Shift` + `6` → H6

#### Example
```markup
<template>
  <div>
    <editor-menu-bar :editor="editor" v-slot="{ commands, isActive }">
      <div>
        <button type="button" :class="{ 'is-active': isActive.heading({ level: 1 }) }" @click="commands.heading({ level: 1})">
          H1
        </button>
        <button type="button" :class="{ 'is-active': isActive.heading({ level: 2 }) }" @click="commands.heading({ level: 2 })">
          H2
        </button>
      </div>
    </editor-menu-bar>

    <editor-content :editor="editor" />
  </div>
</template>

<script>
import { Editor, EditorContent, EditorMenuBar } from 'tiptap'
import { Heading } from 'tiptap-extensions'

export default {
  components: {
    EditorMenuBar,
    EditorContent,
  },
  data() {
    return {
      editor: new Editor({
        extensions: [
          new Heading({
            levels: [1, 2],
          }),
        ],
        content: `
          <h1>This is a headline level 1</h1>
          <h2>This is a headline level 2</h2>
          <h3>This headline will be converted to a paragraph, because it's not defined in the levels option.</h3>
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