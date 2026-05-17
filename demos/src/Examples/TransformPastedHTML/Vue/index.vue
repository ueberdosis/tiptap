<template>
  <div>
    <div v-if="editor" class="control-group">
      <div class="button-group">
        <button @click="pasteWithTabs" type="button">Paste with Tabs</button>
        <button @click="pasteWithFoo" type="button">Paste with "foo"</button>
        <button @click="pasteWithStyles" type="button">Paste with Styles</button>
      </div>
    </div>

    <editor-content :editor="editor" />
  </div>
</template>

<script>
import { Extension } from '@tiptap/core'
import StarterKit from '@tiptap/starter-kit'
import { Editor, EditorContent } from '@tiptap/vue-3'

export default {
  components: {
    EditorContent,
  },

  data() {
    return {
      editor: null,
      tabsHTML: '<p>This\ttext\thas\ttabs\tbetween\twords</p>',
      fooHTML: '<p>The foo is strong in this foo. Foo fighters unite!</p>',
      styledHTML:
        '<p style="background-color: yellow; padding: 20px;">This has <span style="color: red;">inline</span> styles that will be removed</p>',
    }
  },

  methods: {
    pasteHTML(html) {
      // Get the transformed HTML by calling the view's transformPastedHTML
      const transformedHTML = this.editor.view.props.transformPastedHTML?.(html) || html

      // Insert the transformed HTML at the current position
      this.editor.chain().focus().insertContent(transformedHTML).run()
    },

    pasteWithTabs() {
      this.pasteHTML(this.tabsHTML)
    },

    pasteWithFoo() {
      this.pasteHTML(this.fooHTML)
    },

    pasteWithStyles() {
      this.pasteHTML(this.styledHTML)
    },
  },

  mounted() {
    // Create extension that replaces words
    const WordReplacerExtension = Extension.create({
      name: 'wordReplacer',
      priority: 100,

      transformPastedHTML(html) {
        // Replace "foo" with "bar" in text content
        return html.replace(/\bfoo\b/gi, 'bar')
      },
    })

    // Create extension that converts tabs to spaces
    const TabToSpacesExtension = Extension.create({
      name: 'tabToSpaces',
      priority: 110, // Higher priority = runs first

      transformPastedHTML(html) {
        // Convert tabs to 2 spaces
        return html.replace(/\t/g, '  ')
      },
    })

    // Create extension that normalizes line breaks
    const LineBreakExtension = Extension.create({
      name: 'lineBreak',
      priority: 90,

      transformPastedHTML(html) {
        // Convert double line breaks to paragraph breaks
        return html.replace(/\n\n+/g, '</p><p>')
      },
    })

    // Create extension that removes inline styles
    const CleanStylesExtension = Extension.create({
      name: 'cleanStyles',
      priority: 80,

      transformPastedHTML(html) {
        // Remove inline style attributes
        return html.replace(/\s+style="[^"]*"/gi, '')
      },
    })

    this.editor = new Editor({
      extensions: [StarterKit, TabToSpacesExtension, WordReplacerExtension, LineBreakExtension, CleanStylesExtension],
      content: `
        <h2>Transform Pasted HTML Demo</h2>
        <p>This demo showcases the <code>transformPastedHTML</code> API that allows extensions to transform pasted HTML content before it's parsed into the editor.</p>

        <h3>How it works:</h3>
        <ol>
          <li><strong>Tab to Spaces</strong> (priority: 110) - Converts tabs to spaces</li>
          <li><strong>Word Replacer</strong> (priority: 100) - Replaces "foo" with "bar"</li>
          <li><strong>Line Break</strong> (priority: 90) - Converts double line breaks to paragraphs</li>
          <li><strong>Clean Styles</strong> (priority: 80) - Removes inline style attributes</li>
        </ol>

        <p>Extensions with higher priority run first. Each extension receives the output from the previous extension's transform, creating a transform chain.</p>

        <h3>Try it:</h3>
        <p>Use the buttons above to simulate the transformation, or try copying and pasting HTML content with tabs, "foo" text, or inline styles from another source to see the API work during actual paste events!</p>

        <p><em>Note: The buttons above simulate the transform for demonstration purposes. Real paste events (Ctrl+V / Cmd+V) will also trigger these transforms automatically.</em></p>
      `,
    })
  },

  beforeUnmount() {
    this.editor.destroy()
  },
}
</script>

<style lang="scss">
/* Control group styles */
.control-group {
  margin-bottom: 1rem;
  padding: 1rem;
  background-color: var(--gray-1);
  border-radius: 0.5rem;
}

.button-group {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;

  button {
    padding: 0.5rem 1rem;
    background-color: var(--purple);
    color: white;
    border: none;
    border-radius: 0.25rem;
    cursor: pointer;
    font-size: 0.875rem;
    font-weight: 500;
    transition: background-color 0.2s;

    &:hover {
      background-color: var(--purple-contrast);
    }
  }
}

/* Basic editor styles */
.tiptap {
  padding: 1rem;
  border: 2px solid var(--gray-3);
  border-radius: 0.5rem;
  min-height: 300px;

  :first-child {
    margin-top: 0;
  }

  /* Code styles */
  code {
    background-color: var(--purple-light);
    border-radius: 0.4rem;
    color: var(--black);
    font-size: 0.85rem;
    padding: 0.25em 0.3em;
  }

  /* List styles */
  ul,
  ol {
    padding: 0 1rem;
    margin: 1.25rem 1rem 1.25rem 0.4rem;

    li p {
      margin-top: 0.25em;
      margin-bottom: 0.25em;
    }
  }

  /* Heading styles */
  h1,
  h2,
  h3,
  h4,
  h5,
  h6 {
    line-height: 1.1;
    margin-top: 2.5rem;
    text-wrap: pretty;
  }

  h1,
  h2 {
    margin-top: 3.5rem;
    margin-bottom: 1.5rem;
  }

  h1 {
    font-size: 1.4rem;
  }

  h2 {
    font-size: 1.2rem;
  }

  h3 {
    font-size: 1.1rem;
  }

  h4,
  h5,
  h6 {
    font-size: 1rem;
  }

  /* Link styles */
  a {
    color: var(--purple);
    cursor: pointer;

    &:hover {
      color: var(--purple-contrast);
    }
  }

  /* Strong styles */
  strong {
    font-weight: 600;
  }
}
</style>
