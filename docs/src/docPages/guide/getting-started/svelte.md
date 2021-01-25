# Svelte

TODO

Svelte REPL: https://svelte.dev/repl/c839da77db2444e5b23a752266613639?version=3.31.2

App.svelte
```html
<script>
	import Editor from './Editor.svelte';
</script>

<Editor />
```

Editor.svelte
```html
<script>
	import { onMount } from 'svelte'
	import { Editor } from '@tiptap/core'
  import { defaultExtensions } from '@tiptap/starter-kit'

  let element
  let editor

  onMount(() => {
    editor = new Editor({
      element: element,
      extensions: defaultExtensions(),
    })
  })
</script>

{#if editor}
  <button on:click={editor.chain().focus().toggleBold().run()} class:error={editor.isActive('bold')}>
    bold
  </button>
  <button on:click={editor.chain().focus().toggleItalic().run()} class:error={editor.isActive('italic')}>
    italic
  </button>
  <button on:click={editor.chain().focus().toggleStrike().run()} class:error={editor.isActive('strike')}>
    strike
  </button>
{/if}

<div bind:this={element} />
