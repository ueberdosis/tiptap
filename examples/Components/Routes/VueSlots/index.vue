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

    <pre>
      {{ content }}
    </pre>

    <component v-bind:is="wrappedContent && {template:wrappedContent}"></component>
  </div>
</template>

<script>
import Vue from 'vue'
import Icon from 'Components/Icon'
import { Editor, EditorContent, EditorMenuBar } from 'tiptap'
import StaffList from './StaffList'
import StaffMember from './StaffMember'

Vue.component('staff-list', StaffList)
Vue.component('staff-member', StaffMember)

const StaffListDefaultSlotExtension = StaffList.slotExtensions.default
const StaffListStaffMembersSlotExtension = StaffList.slotExtensions['staff-members']
const StaffMemberDefaultSlotExtension = StaffMember.slotExtensions.default

export default {
  components: {
    EditorContent,
    EditorMenuBar,
    Icon,
  },
  data() {
    const content = `
<staff-list>
  <template v-slot:default="">
    <h3>Hello there!</h3>
  </template>
  <template v-slot:staff-members="">
    <staff-member name="Mr Not Default">
      <template v-slot:default="slotProps">
        <p>Junior Replace Default Clerk</p>
      </template>
    </staff-member>
  </template>
</staff-list>`

    return {
      content,
      editor: new Editor({
        extensions: [
          new StaffListDefaultSlotExtension(),
          new StaffListStaffMembersSlotExtension(),
          new StaffList.Extension(),
          new StaffMemberDefaultSlotExtension(),
          new StaffMember.Extension(),
        ],
        content,
        onUpdate: ({ getHTML }) => {
          this.content = getHTML()
        },
      }),
    }
  },
  computed: {
    wrappedContent() {
      return `<div>${this.content}</div>`
    },
  },
  beforeDestroy() {
    this.editor.destroy()
  },
}
</script>

<style>
div.editor pre {
  word-wrap: normal;
}
</style>
