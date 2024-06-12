---
title: PHP WYSIWYG
tableOfContents: true
---
# PHP

## Introduction
You can use Tiptap with Laravel, Livewire, Inertia.js, [Alpine.js](/installation/alpine), [Tailwind CSS](/guide/styling#with-tailwind-css), and even - yes you read that right - inside PHP.

## Tiptap for PHP
We provide [an official PHP package to work with Tiptap content](/api/utilities/tiptap-php). You can transform Tiptap-compatible JSON to HTML, and the other way around, sanitize your content, or just modify it.

## Laravel Livewire

### my-livewire-component.blade.php
```html
<!--
  In your livewire component you could add an
  autosave method to handle saving the content
  from the editor every 10 seconds if you wanted
-->
<x-editor
  wire:model="foo"
  wire:poll.10000ms="autosave"
></x-editor>
```
**Note**<br />
The `.defer` modifier is no longer available in Livewire v3 as updating the state is deferred by default. Use the `.live` modifier if you need to update the state server-side as it changes.

### editor.blade.php
```html
<div
  x-data="setupEditor(
    $wire.entangle('{{ $attributes->wire('model')->value() }}').defer
  )"
  x-init="() => init($refs.editor)"
  wire:ignore
  {{ $attributes->whereDoesntStartWith('wire:model') }}
>
  <div x-ref="editor"></div>
</div>
```

### index.js
```js
import { Editor } from '@tiptap/core'
import StarterKit from '@tiptap/starter-kit'

window.setupEditor = function (content) {
  let editor

  return {
    content: content,

    init(element) {
      editor = new Editor({
        element: element,
        extensions: [
          StarterKit,
        ],
        content: this.content,
        onUpdate: ({ editor }) => {
          this.content = editor.getHTML()
        }
      })

      this.$watch('content', (content) => {
        // If the new content matches TipTap's then we just skip.
        if (content === editor.getHTML()) return

        /*
          Otherwise, it means that a force external to TipTap
          is modifying the data on this Alpine component,
          which could be Livewire itself.
          In this case, we just need to update TipTap's
          content and we're good to do.
          For more information on the `setContent()` method, see:
            https://www.tiptap.dev/api/commands/set-content
        */
        editor.commands.setContent(content, false)
      })
    }
  }
}
```
