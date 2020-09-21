# Introduction
tiptap is a renderless wrapper around [ProseMirror](https://ProseMirror.net) – a toolkit for building rich-text editors that is already in use at many well-known companies such as *New York Times*, *The Guardian* or *Atlassian*.

Although tiptap tries to hide most of the complexity of ProseMirror, it’s built on top of its APIs and we strongly recommend you to read through the [ProseMirror Guide](https://ProseMirror.net/docs/guide/). You’ll have a better understanding of how everything works under the hood and get familiar with many terms and jargon used by tiptap.

## Features

**Renderless.** We don’t tell you what a menu should look like or where it should be rendered in the DOM. That’s why tiptap is renderless and comes without any CSS. You are in full control over markup and styling.

**Framework-agnostic.** We don’t care what framework you use. Tiptap is ready to be used with plain JavaScript, Vue.js or React. That makes it even possible to write a renderer for Svelte and others.

**TypeScript.** Tiptap 2 is written in TypeScript. That gives you a nice autocomplete for the API (if your IDE for it), helps to find bugs early and makes it possible to generate [a complete API documentation](#) on top of the extensive human written documentation.

## Who uses tiptap?
- [GitLab](https://gitlab.com)
- [Statamic CMS](https://statamic.com)
- [Twill CMS](https://twill.io)
- [ApostropheCMS](https://apostrophecms.com)
- [Directus CMS](https://directus.io)
- [Nextcloud](https://apps.nextcloud.com/apps/text)
- [Craft CMS](https://craftcms.com/)
- [and many more →](https://github.com/ueberdosis/tiptap/network/dependents?package_id=UGFja2FnZS0xMzE5OTg0ODc%3D)
