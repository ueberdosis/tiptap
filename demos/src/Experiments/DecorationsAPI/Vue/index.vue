<template>
  <div style="padding: 20px">
    <h1>Tiptap Decorations API Demo (Vue 3)</h1>
    <p style="color: #666; margin-bottom: 20px">This demo showcases three practical uses of the Decorations API:</p>
    <editor-content :editor="editor" />
  </div>
</template>

<script setup>
import StarterKit from '@tiptap/starter-kit'
import { EditorContent, useEditor } from '@tiptap/vue-3'
import { onBeforeUnmount } from 'vue'

import { BlockActionsExtension } from './BlockActionsExtension.js'
import { KeywordHighlightingExtension } from './KeywordHighlightingExtension.js'
import { ReadabilityScoringExtension } from './ReadabilityScoringExtension.js'
import { SelectionIndicatorExtension } from './SelectionIndicatorExtension.js'

const editor = useEditor({
  extensions: [
    StarterKit,
    KeywordHighlightingExtension,
    ReadabilityScoringExtension,
    BlockActionsExtension,
    SelectionIndicatorExtension,
  ],
  content: `
    <h2>Decorations API Examples</h2>

    <h3>1. Keyword Highlighting (Inline Decoration)</h3>
    <p>This example highlights important keywords in the text. The word important appears here, and so does the word todo. You can configure which words to highlight and their colors. Try adding note or warning to see them highlighted in different colors.</p>

    <h3>2. Readability Scoring (Node Decoration)</h3>
    <p>This paragraph is short and easy to read. Notice the green background indicates easy readability.</p>
    <p>This paragraph contains a more complex sentence structure with multiple clauses and subordinate phrases that increase the overall difficulty of comprehension for the average reader.</p>
    <p>Note that the readability score gets updated as you edit. Shorter sentences with simple words get green (easy), medium complexity gets yellow, and complex paragraphs get red (hard).</p>

    <h3>3. Block Actions (Widget Decoration)</h3>
    <p>Hover at the end of paragraphs and headings to see duplicate and delete buttons. Click the duplicate button to copy a block, or delete to remove it. This widget demonstrates how decorations can provide quick actions for editing.</p>
    <p>Try duplicating this paragraph or deleting blocks to see how the widget decorations update in real-time.</p>

    <h3>4. Selection Indicator (Widget Decoration — Updates only on selection changes)</h3>
    <p>This widget displays information about the current selection (cursor or selected text) and is intentionally implemented to only re-render when the selection changes — not for every document edit. Try selecting text to see the widget update, and edit the document elsewhere to observe it remains unchanged.</p>
  `,
})

onBeforeUnmount(() => {
  editor.value?.destroy()
})
</script>

<style lang="scss">
/* Basic editor styles */
.tiptap {
  :first-child {
    margin-top: 0;
  }

  h2 {
    margin-top: 1.5em;
    margin-bottom: 0.5em;
    border-bottom: 2px solid #ddd;
    padding-bottom: 0.5em;
  }

  h3 {
    margin-top: 1.2em;
    margin-bottom: 0.5em;
    color: #333;
  }

  /* Keyword Highlighting - Inline Decoration */
  .highlight-important {
    background-color: #ffd700;
    font-weight: 500;
    padding: 2px 4px;
    border-radius: 2px;
  }

  .highlight-todo {
    background-color: #ffcccc;
    color: #cc0000;
    font-weight: 500;
    padding: 2px 4px;
    border-radius: 2px;
  }

  .highlight-note {
    background-color: #ccf2ff;
    color: #0066cc;
    font-weight: 500;
    padding: 2px 4px;
    border-radius: 2px;
  }

  .highlight-warning {
    background-color: #ffe6cc;
    color: #ff6600;
    font-weight: 500;
    padding: 2px 4px;
    border-radius: 2px;
  }

  /* Readability Scoring - Node Decoration */
  .readability-easy {
    border-left: 4px solid #22c55e;
    padding-left: 12px;
    background-color: #f0fdf4;
  }

  .readability-medium {
    border-left: 4px solid #eab308;
    padding-left: 12px;
    background-color: #fefce8;
  }

  .readability-hard {
    border-left: 4px solid #ef4444;
    padding-left: 12px;
    background-color: #fef2f2;
  }

  .readability-empty {
    border-left: 4px solid #d1d5db;
    padding-left: 12px;
    background-color: #f9fafb;
    color: #999;
    font-style: italic;
  }

  /* Footnote Widget styling */
  .footnote-indicator {
    display: inline-block;
    vertical-align: super;
    font-size: 0.8em;
  }

  /* Selection Indicator Widget */
  /* Make editor container positioned so absolute widgets can be placed relative to it */
  .ProseMirror {
    position: relative;
  }

  .selection-indicator {
    position: absolute;
    pointer-events: none;
    user-select: none;
    white-space: nowrap;
    width: 0;
    height: 0;
    overflow: visible;
  }

  .selection-indicator__badge {
    display: inline-block;
    background: rgba(55, 65, 81, 0.9);
    color: white;
    font-size: 12px;
    padding: 6px 8px;
    border-radius: 999px;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
    pointer-events: none;
    user-select: none;
  }

  /* Modifier for interactive badge (allows pointer events) */
  .selection-indicator__badge--interactive {
    pointer-events: auto;
  }

  /* Modifier for selectable badge (allows user selection) */
  .selection-indicator__badge--selectable {
    user-select: auto;
  }
}
</style>
