<template>
  <div v-if="editor">
    <button @click="editor.chain().focus().toggleHeading({ level: 1 }).run()">
      H1
    </button>
    <button @click="editor.chain().focus().toggleHeading({ level: 2 }).run()">
      H2
    </button>
    <button @click="editor.chain().focus().toggleBold().run()">
      Bold
    </button>
    <button @click="editor.chain().focus().toggleBulletList().run()" :class="{ 'is-active': editor.isActive('bulletList') }">
      Bullet list
    </button>
    <button @click="editor.chain().focus().lockDragHandle().run()">
      Lock drag handle
    </button>
    <button @click="editor.chain().focus().unlockDragHandle().run()">
      Unlock drag handle
    </button>
    <button @click="editor.chain().focus().toggleDragHandle().run()">
      Toggle drag handle
    </button>
    <button @click="editor.setEditable(!editor.isEditable)">
      Toggle editable
    </button>
    <drag-handle :editor="editor">
      <div class="custom-drag-handle" />
    </drag-handle>
  </div>

  <editor-content :editor="editor" />
</template>

<script>
import { DragHandle } from '@tiptap/extension-drag-handle-vue-3'
import NodeRange from '@tiptap/extension-node-range'
import StarterKit from '@tiptap/starter-kit'
import { Editor, EditorContent } from '@tiptap/vue-3'

export default {
  components: {
    EditorContent,
    DragHandle,
  },
  data() {
    return {
      editor: null,
    }
  },
  mounted() {
    this.editor = new Editor({
      extensions: [
        StarterKit,
        NodeRange.configure({
          // allow to select only on depth 0
          // depth: 0,
          key: null,
        }),
      ],
      content: `
        <h1>This is a demo file for our Drag Handle extension experiement.</h1>
        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ipsum suspendisse ultrices gravida dictum fusce ut placerat. Viverra mauris in aliquam sem fringilla. Sit amet commodo nulla facilisi nullam. Viverra orci sagittis eu volutpat odio facilisis mauris sit. In hendrerit gravida rutrum quisque non tellus orci ac. Pellentesque adipiscing commodo elit at imperdiet. Pulvinar sapien et ligula ullamcorper malesuada proin. Odio pellentesque diam volutpat commodo. Pharetra diam sit amet nisl suscipit adipiscing bibendum est ultricies.</p>
        <p>Odio eu feugiat pretium nibh ipsum consequat nisl. Velit euismod in pellentesque massa placerat. Vel quam elementum pulvinar etiam non quam. Sit amet purus gravida quis. Tincidunt eget nullam non nisi est sit. Eget nulla facilisi etiam dignissim diam. Magnis dis parturient montes nascetur ridiculus mus mauris vitae. Vitae congue eu consequat ac felis donec et odio pellentesque. Sit amet porttitor eget dolor morbi non arcu risus quis. Suspendisse ultrices gravida dictum fusce ut. Tortor vitae purus faucibus ornare. Faucibus ornare suspendisse sed nisi lacus sed. Tristique senectus et netus et.</p>
        <p>Cursus euismod quis viverra nibh cras pulvinar mattis nunc. Sem viverra aliquet eget sit amet tellus. Nec ullamcorper sit amet risus nullam. Facilisis gravida neque convallis a cras semper auctor. Habitant morbi tristique senectus et netus et malesuada fames ac. Dui vivamus arcu felis bibendum. Velit laoreet id donec ultrices. Enim diam vulputate ut pharetra sit. Aenean pharetra magna ac placerat vestibulum lectus mauris. Mi eget mauris pharetra et ultrices. Lacus viverra vitae congue eu consequat ac felis donec.</p>
        <h2></h2>
        <p>Odio eu feugiat pretium nibh ipsum consequat nisl. Velit euismod in pellentesque massa placerat. Vel quam elementum pulvinar etiam non quam. Sit amet purus gravida quis. Tincidunt eget nullam non nisi est sit. Eget nulla facilisi etiam dignissim diam. Magnis dis parturient montes nascetur ridiculus mus mauris vitae. Vitae congue eu consequat ac felis donec et odio pellentesque. Sit amet porttitor eget dolor morbi non arcu risus quis. Suspendisse ultrices gravida dictum fusce ut. Tortor vitae purus faucibus ornare. Faucibus ornare suspendisse sed nisi lacus sed. Tristique senectus et netus et.</p>
        <p>Cursus euismod quis viverra nibh cras pulvinar mattis nunc. Sem viverra aliquet eget sit amet tellus. Nec ullamcorper sit amet risus nullam. Facilisis gravida neque convallis a cras semper auctor. Habitant morbi tristique senectus et netus et malesuada fames ac. Dui vivamus arcu felis bibendum. Velit laoreet id donec ultrices. Enim diam vulputate ut pharetra sit. Aenean pharetra magna ac placerat vestibulum lectus mauris. Mi eget mauris pharetra et ultrices. Lacus viverra vitae congue eu consequat ac felis donec.</p>
        <ul>
          <li>Bullet Item 1</li>
          <li>Bullet Item 2</li>
          <li>Bullet Item 3</li>
        </ul>
        <h2>Lorem Ipsum</h2>
        <p>Tincidunt ornare massa eget egestas. Neque convallis a cras semper auctor neque. Eget nulla facilisi etiam dignissim diam quis enim. Phasellus vestibulum lorem sed risus ultricies tristique nulla aliquet enim. At tempor commodo ullamcorper a lacus vestibulum sed arcu. Sed vulputate mi sit amet mauris commodo quis imperdiet. Eget gravida cum sociis natoque. Lacinia quis vel eros donec ac odio tempor orci dapibus. Integer vitae justo eget magna fermentum iaculis eu non. Sed odio morbi quis commodo. Neque sodales ut etiam sit amet. Ipsum nunc aliquet bibendum enim facilisis gravida neque convallis a. Tempus quam pellentesque nec nam aliquam sem et tortor consequat. Urna nec tincidunt praesent semper feugiat nibh sed pulvinar proin. Lacus sed turpis tincidunt id aliquet risus feugiat in. Et leo duis ut diam quam nulla. Ultrices eros in cursus turpis. Adipiscing elit ut aliquam purus sit amet luctus venenatis.</p>
        <h3>Lorem Ipsum</h3>
        <p>Sapien eget mi proin sed libero enim sed faucibus. Aliquam id diam maecenas ultricies mi eget mauris. Amet mattis vulputate enim nulla aliquet porttitor lacus. Pulvinar elementum integer enim neque volutpat ac. Libero volutpat sed cras ornare arcu dui vivamus arcu felis. Urna nunc id cursus metus aliquam eleifend mi in nulla. Justo laoreet sit amet cursus sit. In massa tempor nec feugiat nisl pretium fusce. Vel quam elementum pulvinar etiam non. Nisl nisi scelerisque eu ultrices vitae. Odio ut enim blandit volutpat maecenas volutpat blandit aliquam.</p>
      `,
    })
  },
  beforeUnmount() {
    this.editor?.destroy()
  },
}
</script>

<style lang="scss">
::selection {
  background-color: #70CFF850;
}

.ProseMirror {
  padding: 1rem 1rem 1rem 0;

  * {
    margin-top: 0.75em;
  }

  > * {
    margin-left: 3rem;
  }

  .ProseMirror-widget * {
    margin-top: auto
  }

  ul,
  ol {
    padding: 0 1rem;
  }
}

.ProseMirror-noderangeselection {
  *::selection {
    background: transparent;
  }

  * {
    caret-color: transparent;
  }
}

.ProseMirror-selectednode,
.ProseMirror-selectednoderange {
  position: relative;

  &::before {
    position: absolute;
    pointer-events: none;
    z-index: -1;
    content: '';
    top: -0.25rem;
    left: -0.25rem;
    right: -0.25rem;
    bottom: -0.25rem;
    background-color: #70CFF850;
    border-radius: 0.2rem;
  }
}

.custom-drag-handle {
  &::after {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 1rem;
    height: 1.25rem;
    content: '⠿';
    font-weight: 700;
    cursor: grab;
    background:#0D0D0D10;
    color: #0D0D0D50;
    border-radius: 0.25rem;
  }
}
</style>
