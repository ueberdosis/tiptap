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
import StaffMember from './StaffMember'

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
          new StaffList.extensions.DefaultBlockSlotExtension(),
          new StaffList.extensions.StaffMemberSlotExtension(),
          new StaffList.extensions.NodeExtension(),
          new StaffMember.extensions.DefaultBlockSlotExtension(),
          new StaffMember.extensions.NodeExtension(),
        ],
        content: `
          <staff-list>
            <template v-slot:default="slotProps">
              <h3>Our Staff</h3>
              <p>We are all beautiful!</p>
            </template>
            <template v-slot:staff-members="slotProps">
              <staff-member name="Mr En Jibby" avatar="enjibby-grinning.jpg">
                <template v-slot:default="slotProps">
                  <p>Chief Speculative Programming Officer<p>
                </template>
              </staff-member>
            </template>
          </staff-list>
        `,
      }),
    }
  },
  beforeDestroy() {
    this.editor.destroy()
  },
}
</script>
