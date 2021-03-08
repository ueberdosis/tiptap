# Svelte

## toc

## Introduction
The following guide describes how to integrate tiptap with your Svelte project.

TODO

Svelte REPL: https://svelte.dev/repl/3651789dcfcb40de80b1ba36263d4bbd?version=3.31.2

App.svelte
```html
<script>
	import Editor from './Editor.svelte';
</script>

<Editor />
```

Editor.svelte
```html
<script type="module">
  import { onMount, onDestroy } from 'svelte'
  import { Editor } from '@tiptap/core'
  import { defaultExtensions } from '@tiptap/starter-kit'

  let element
  let editor

  onMount(() => {
    editor = new Editor({
      element: element,
      extensions: defaultExtensions(),
      content: '<p>Hello <strong>Svelte</strong>!<p>',
      onTransaction: () => {
        // force re-render so `editor.isActive` works as expected
        editor = editor
      },
    })
  })

  onDestroy(() => {
    editor.destroy()
  })
</script>

{#if editor}
  <button on:click={() => editor.chain().focus().toggleBold().run()} class:active={editor.isActive('bold')}>
    Bold
  </button>
  <button on:click={() => editor.chain().focus().toggleItalic().run()} class:active={editor.isActive('italic')}>
    Italic
  </button>
  <button on:click={() => editor.chain().focus().toggleStrike().run()} class:active={editor.isActive('strike')}>
    Strike
  </button>
{/if}

<div bind:this={element} />

<style>
  button.active {
    background: black;
    color: white;
  }
</style>
```
