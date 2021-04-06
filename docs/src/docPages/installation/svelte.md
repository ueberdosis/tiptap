---
title: Svelte WYSIWYG
---

# Svelte

## toc

## Introduction
The following guide describes how to integrate tiptap with your [SvelteKit](https://kit.svelte.dev/) project.

## Take a shortcut: Svelte REPL with tiptap
If you just want to jump into it right-away, here is a [Svelte REPL with tiptap](https://svelte.dev/repl/798f1b81b9184780aca18d9a005487d2?version=3.31.2) installed.

## Requirements
* [Node](https://nodejs.org/en/download/) installed on your machine
* Experience with [Svelte](https://vuejs.org/v2/guide/#Getting-Started)

## 1. Create a project (optional)
If you already have an existing SvelteKit project, that’s fine too. Just skip this step and proceed with the next step.

For the sake of this guide, let’s start with a fresh SvelteKit project called `tiptap-example`. The following commands set up everything we need. It asks a lot of questions, but just use what floats your boat or use the defaults.

```bash
mkdir tiptap-example
cd tiptap-example
npm init svelte@next
npm install
npm run dev
```

## 2. Install the dependencies
Okay, enough of the boring boilerplate work. Let’s finally install tiptap! For the following example you’ll need the `@tiptap/core` package, with a few components, and `@tiptap/starter-kit` which has the most common extensions to get started quickly.

```bash
# install with npm
npm install @tiptap/core @tiptap/starter-kit

# install with Yarn
yarn add @tiptap/core @tiptap/starter-kit
```

If you followed step 1 and 2, you can now start your project with `npm run dev` or `yarn dev`, and open [http://localhost:3000/](http://localhost:3000/) in your favorite browser. This might be different, if you’re working with an existing project.

## 3. Create a new component
To actually start using tiptap, you’ll need to add a new component to your app. Let’s call it `Tiptap` and put the following example code in `src/lib/Tiptap.svelte`.

This is the fastest way to get tiptap up and running with SvelteKit. It will give you a very basic version of tiptap, without any buttons. No worries, you will be able to add more functionality soon.

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
      content: '<p>Hello World! 🌍️ </p>',
      onTransaction: () => {
        // force re-render so `editor.isActive` works as expected
        editor = editor
      },
    })
  })

  onDestroy(() => {
    if (editor) {
      editor.destroy()
    }
  })
</script>

{#if editor}
  <button
    on:click={() => editor.chain().focus().toggleHeading({ level: 1}).run()}
    class:active={editor.isActive('heading', { level: 1 })}
  >
    H1
  </button>
  <button
    on:click={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
    class:active={editor.isActive('heading', { level: 2 })}
  >
    H2
  </button>
  <button on:click={() => editor.chain().focus().setParagraph().run()} class:active={editor.isActive('paragraph')}>
    P
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

## 4. Add it to your app
Now, let’s replace the content of `src/routes/index.svelte` with the following example code to use our new `Tiptap` component in our app.

```html
<script>
  import Tiptap from '$lib/Tiptap.svelte'
</script>

<main>
  <Tiptap />
</main>
```

You should now see tiptap in your browser. You’ve successfully set up tiptap! Time to give yourself a pat on the back.
