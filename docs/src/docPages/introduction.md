---
title: Headless rich-text editor
---

:::error Don’t try this at home
Nothing here is production-ready, don’t use it anywhere.
:::

# Introduction

<!-- [![Version](https://img.shields.io/npm/v/@tiptap/core.svg?label=version)](https://www.npmjs.com/package/@tiptap/core) -->
<!-- [![Downloads](https://img.shields.io/npm/dm/@tiptap/core.svg)](https://npmcharts.com/compare/@tiptap/core?minimal=true) -->
<!-- [![License](https://img.shields.io/npm/l/@tiptap/core.svg)](https://www.npmjs.com/package/@tiptap/core) -->
<!-- [![Filesize](https://img.badgesize.io/https://unpkg.com/tiptap/dist/tiptap.min.js?compression=gzip&label=size&colorB=000000)](https://www.npmjs.com/package/tiptap) -->
<!-- [![Build Status](https://github.com/ueberdosis/tiptap-next/workflows/build/badge.svg)](https://github.com/ueberdosis/tiptap-next/actions) -->
[![Sponsor](https://img.shields.io/static/v1?label=Sponsor&message=%E2%9D%A4&logo=GitHub)](https://github.com/sponsors/ueberdosis)

tiptap is a headless wrapper around [ProseMirror](https://ProseMirror.net) – a toolkit for building rich-text WYSIWYG editors, which is already in use at many well-known companies such as *New York Times*, *The Guardian* or *Atlassian*.

Although tiptap tries to hide most of the complexity of ProseMirror, it’s built on top of its APIs and we recommend you to read through the [ProseMirror Guide](https://ProseMirror.net/docs/guide/) for advanced usage. You’ll have a better understanding of how everything works under the hood and get more familiar with many terms and jargon used by tiptap.

## Features

**Headless.** We don’t tell you what a menu should look like or where it should be rendered in the DOM. That’s why tiptap is headless and comes without any CSS. You are in full control over markup and styling.

**Framework-agnostic.** We don’t care what framework you use. tiptap is ready to be used with plain JavaScript or Vue.js. That makes it even possible to write a renderer for React, Svelte and others.

**TypeScript.** tiptap 2 is written in TypeScript. That gives you a nice autocomplete for the API (if your IDE supports that), helps to find bugs early and makes it possible to generate [a complete API documentation](#) on top of the extensive human written documentation.

## Who uses tiptap?
- [GitLab](https://gitlab.com)
- [Statamic CMS](https://statamic.com)
- [Twill CMS](https://twill.io)
- [ApostropheCMS](https://apostrophecms.com)
- [Directus CMS](https://directus.io)
- [Nextcloud](https://apps.nextcloud.com/apps/text)
- [and many more →](https://github.com/ueberdosis/tiptap/network/dependents?package_id=UGFja2FnZS0xMzE5OTg0ODc%3D)

## License
tiptap is licensed under MIT, so you’re free to whatever you want. Anyway, we kindly ask you to [become a sponsor](https://github.com/sponsors/ueberdosis) on GitHub to fund the development, maintenance and support of tiptap.
