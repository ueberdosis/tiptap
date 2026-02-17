<template>
  <div v-if="editor">
    <button @click="editor.chain().focus().toggleHeading({ level: 1 }).run()">H1</button>
    <button @click="editor.chain().focus().toggleHeading({ level: 2 }).run()">H2</button>
    <button @click="editor.chain().focus().toggleBold().run()">Bold</button>
    <button
      @click="editor.chain().focus().toggleBulletList().run()"
      :class="{ 'is-active': editor.isActive('bulletList') }"
    >
      Bullet list
    </button>
    <button @click="editor.chain().focus().lockDragHandle().run()">Lock drag handle</button>
    <button @click="editor.chain().focus().unlockDragHandle().run()">Unlock drag handle</button>
    <button @click="editor.chain().focus().toggleDragHandle().run()">Toggle drag handle</button>
    <button @click="editor.setEditable(!editor.isEditable)">Toggle editable</button>
    <button @click="nested = !nested">Toggle nested</button>
    <drag-handle :editor="editor" :nested="nestedOptions">
      <div class="custom-drag-handle" />
    </drag-handle>
  </div>

  <editor-content :editor="editor" />
</template>

<script>
import { DragHandle } from '@tiptap/extension-drag-handle-vue-3'
import Image from '@tiptap/extension-image'
import NodeRange from '@tiptap/extension-node-range'
import StarterKit from '@tiptap/starter-kit'
import { Editor, EditorContent } from '@tiptap/vue-3'

const NESTED_CONFIG = { edgeDetection: { threshold: -16 } }

export default {
  components: {
    EditorContent,
    DragHandle,
  },
  data() {
    return {
      editor: null,
      nested: true,
    }
  },
  computed: {
    nestedOptions() {
      return this.nested ? NESTED_CONFIG : false
    },
  },
  mounted() {
    this.editor = new Editor({
      extensions: [
        StarterKit,
        Image.configure({ inline: false }),
        NodeRange.configure({
          // allow to select only on depth 0
          // depth: 0,
          key: null,
        }),
      ],
      content: `
        <h1>The Complete Guide to Modern Web Development</h1>
        <p>Web development has evolved significantly over the past decade. What once required multiple tools and complex setups can now be accomplished with modern frameworks and libraries that prioritize developer experience.</p>

        <img src="https://unsplash.it/500/500" alt="Random Image" />

        <h2>Getting Started</h2>
        <p>Before diving into the technical details, it's important to understand the foundational concepts that make modern web development possible.</p>

        <blockquote>
          <p>"The best code is no code at all. Every new line of code you willingly bring into the world is code that has to be debugged, code that has to be read and understood." - Jeff Atwood</p>
        </blockquote>

        <p>This philosophy guides much of modern development practices, emphasizing simplicity and maintainability over complexity.</p>

        <hr>

        <h2>Key Technologies</h2>
        <p>Here are the essential technologies every web developer should be familiar with:</p>

        <ul>
          <li>HTML5 and semantic markup</li>
          <li>CSS3 with modern layout techniques
            <ul>
              <li>Flexbox for one-dimensional layouts</li>
              <li>Grid for two-dimensional layouts</li>
              <li>Custom properties (CSS variables)</li>
            </ul>
          </li>
          <li>JavaScript (ES6+)</li>
          <li>TypeScript for type safety</li>
        </ul>

        <h3>Framework Comparison</h3>
        <p>Choosing the right framework depends on your project requirements:</p>

        <ol>
          <li>React - Component-based UI library</li>
          <li>Vue - Progressive framework</li>
          <li>Angular - Full-featured platform</li>
          <li>Svelte - Compile-time framework</li>
        </ol>

        <hr>

        <h2>Best Practices</h2>
        <p>Following established best practices ensures your code remains maintainable and scalable.</p>

        <blockquote>
          <p>Always write code as if the person who ends up maintaining it is a violent psychopath who knows where you live.</p>
        </blockquote>

        <h3>Code Organization</h3>
        <p>A well-organized codebase is crucial for long-term project success. Consider these principles:</p>

        <ul>
          <li>Separation of concerns</li>
          <li>DRY (Don't Repeat Yourself)</li>
          <li>KISS (Keep It Simple, Stupid)</li>
        </ul>

        <p>By following these guidelines, you'll create applications that are easier to maintain, test, and extend over time.</p>
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
  background-color: #70cff850;
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
    margin-top: auto;
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
    background-color: #70cff850;
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
    background: #0d0d0d10;
    color: #0d0d0d50;
    border-radius: 0.25rem;
  }
}
</style>
