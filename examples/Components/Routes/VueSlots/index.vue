<template>
  <div class="editor">
    <editor-menu-bar :editor="editor" v-slot="{ commands, isActive }">
      <div class="menubar">

        <button
          class="menubar__button"
          :class="{ 'is-active': isActive.stafflist() }"
          @click="commands.stafflist"
        >
          <icon name="bold" />
        </button>

        <button
          class="menubar__button"
          :class="{ 'is-active': isActive.staffmember() }"
          @click="commands.staffmember"
        >
          <icon name="italic" />
        </button>
      </div>
    </editor-menu-bar>

    <editor-content class="editor__content" :editor="editor" />
  </div>
</template>

<script>
import Icon from 'Components/Icon'
import { Editor, EditorContent, EditorMenuBar } from 'tiptap'
import StaffList from './StaffList'

export default {
  components: {
    EditorContent,
    EditorMenuBar,
    Icon,
  },
  data() {
    return {
      editor: new Editor({
        extensions: [
          new StaffList.Extension(),
        ],
        content: `
          <p>Insert a staff list</p>
        `,
      }),
    }
  },
  beforeDestroy() {
    this.editor.destroy()
  },
}
</script>
