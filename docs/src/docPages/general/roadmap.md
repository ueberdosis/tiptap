# Roadmap

## Tasks

1. Refactoring the API & Extension Manager
2. Improve testing: Add editor instance to the DOM element
3. Building the first batch of basic extensions (bold, italic), writing tests
4. Building more complex examples from the extensions

## New features

* generate schema without initializing tiptap, to make SSR easier (e. g. `getSchema([new Doc(), new Paragraph()])`)

## Requested features

* Basic Styling
    * https://github.com/ueberdosis/tiptap/issues/507
* Support vor Vue.js 3
* Easily add custom classes to everything
    * https://github.com/ueberdosis/tiptap/discussions/817
* Text snippets
    * https://github.com/ueberdosis/tiptap/issues/737
* Markdown Support

## Requested extensions

* Alignment
    * https://github.com/ueberdosis/tiptap/pull/544
* Font color
* Font family
* Font size
* Created embed from pasted YouTube URL
* Superscript/Subscript
    * https://github.com/ueberdosis/tiptap/discussions/813
* Math Support
    * https://github.com/ueberdosis/tiptap/issues/179
    * https://github.com/ueberdosis/tiptap/issues/698
* Resizeable Images
    * https://gist.github.com/zachjharris/a5442efbdff11948d085b6b1406dfbe6