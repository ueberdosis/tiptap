# tiptap 2.x Preview
> Don’t use this in production. It’s full of bugs and the API will likely change.

A renderless and extendable rich-text editor for [Vue.js](https://github.com/vuejs/vue)

<!-- [![Version](https://img.shields.io/npm/v/tiptap.svg?label=version)](https://www.npmjs.com/package/tiptap)
[![Downloads](https://img.shields.io/npm/dm/tiptap.svg)](https://npmcharts.com/compare/tiptap?minimal=true)
[![License](https://img.shields.io/npm/l/tiptap.svg)](https://www.npmjs.com/package/tiptap)
[![Filesize](https://img.badgesize.io/https://unpkg.com/tiptap/dist/tiptap.min.js?compression=gzip&label=size&colorB=000000)](https://www.npmjs.com/package/tiptap) -->
[![Build Status](https://github.com/ueberdosis/tiptap-next/workflows/build/badge.svg)](https://github.com/ueberdosis/tiptap-next/actions)
[![Sponsor](https://img.shields.io/static/v1?label=Sponsor&message=%E2%9D%A4&logo=GitHub)](https://github.com/sponsors/ueberdosis)

## Why we built tiptap
We were looking for a text editor for [Vue.js](https://github.com/vuejs/vue) and found some solutions that didn’t really satisfy me. The editor should be easy to extend and not based on old dependencies such as jQuery. For React there is already a great editor called [Slate.js](https://github.com/ianstormtaylor/slate), which impresses with its modularity. I came across [ProseMirror](https://github.com/prosemirror) and decided to build on it. ProseMirror is a toolkit for building rich-text editors that are already in use at many well-known companies such as *Atlassian* or *New York Times*.

### What does `renderless` mean?
With renderless components you'll have (almost) full control over markup and styling. We don’t want to tell you what a menu should look like or where it should be rendered in the DOM. That’s all up to you. There is also a [great article about renderless components](https://adamwathan.me/renderless-components-in-vuejs/) by Adam Wathan.

### How is the data stored under the hood?
You can save your data as a raw `HTML` string or can get a `JSON`-serializable representation of your document. And of course, you can pass these two types back to the editor.

## 💖 Sponsor the development
Are you using tiptap in production? We need your sponsorship to maintain, update and develop tiptap. [Become a Sponsor now!](https://github.com/sponsors/ueberdosis)

## Documentation
To check out some live examples, visit [next.tiptap.dev](https://next.tiptap.dev/).

## Contributing
Please see [CONTRIBUTING](CONTRIBUTING.md) for details.

## Credits
- [Philipp Kühn](https://github.com/philippkuehn)
- [Hans Pagel](https://github.com/hanspagel)
- [All Contributors](../../contributors)

## Related Projects
- [prosemirror-php](https://github.com/ueberdosis/prosemirror-php) by @hanspagel
- [html-to-prosemirror](https://github.com/ueberdosis/html-to-prosemirror) by @hanspagel
- [prosemirror-to-html](https://github.com/ueberdosis/prosemirror-to-html) by @hanspagel
