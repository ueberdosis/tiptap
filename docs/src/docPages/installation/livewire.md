---
title: Livewire WYSIWYG
---

# Livewire

## toc

## Introduction
The following guide describes how to integrate tiptap with your [Livewire](https://laravel-livewire.com/) project.

TODO

## editor.blade.php
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

## my-livewire-component.blade.php
```html
<div
  x-data="setupEditor(
    @entangle($attributes->wire('model')).defer
  )"
  x-init="() => init($refs.editor)"
  x-on:click.away="inFocus = false;"
  wire:ignore
  {{ $attributes->whereDoesntStartWith('wire:model') }}
>
  <div x-ref="editor"></div>
</div>
```

## index.js
```js
import { Editor as TipTap } from "@tiptap/core"
import { defaultExtensions } from "@tiptap/starter-kit"

window.setupEditor = function (content) {
  return {
    content: content,
    inFocus: false,
    // updatedAt is to force Alpine to
    // rerender on selection change
    updatedAt: Date.now(),
    editor: null,

    init(el) {
      let editor = new TipTap({
        element: el,
        extensions: defaultExtensions(),
        content: this.content,
        editorProps: {
          attributes: {
            class: "prose-sm py-4 focus:outline-none"
          }
        }
      })

      editor.on("update", () => {
        this.content = this.editor.getHTML()
      })

      editor.on("focus", () => {
        this.inFocus = true
      })

      editor.on("selection", () => {
        this.updatedAt = Date.now()
      })

      this.editor = editor
    }
  }
}
```
