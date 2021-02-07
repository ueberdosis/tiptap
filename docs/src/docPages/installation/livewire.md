# Livewire

## toc

## Introduction
The following guide describes how to integrate tiptap with your [Livewire](https://laravel-livewire.com/) project.

TODO

editor.blade.php

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

my-livewire-component.blade.php

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
