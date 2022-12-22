---
tableOfContents: true
---

# Peer dependencies

## Introduction
With the release of version 2.0.0-beta.205 we introduced peer dependencies. Most packages require the installation of peer dependencies.

## Why peer dependencies
In the past it has happened that users installed ProseMirror or Yjs packages to develope their own extensions, which had a different version than the ones included in Tiptap. This has caused version clashes.

## How to install

### NPM 7 or higher
If you are using NPM 7 or higher, you can ignore the following notes. NPM installs peer dependencies automatically and no further action is required.

### Yarn, pNPM, npm 6 or less

#### @tiptap/core 

| Package manager    | Command                                                                                                                                                   |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Yarn               | `yarn add prosemirror-commands prosemirror-keymap prosemirror-model prosemirror-schema-list prosemirror-state prosemirror-transform prosemirror-view`     |
| pNPM               | `pnpm install prosemirror-commands prosemirror-keymap prosemirror-model prosemirror-schema-list prosemirror-state prosemirror-transform prosemirror-view` |
| npm 6 or less      | `npm install prosemirror-commands prosemirror-keymap prosemirror-model prosemirror-schema-list prosemirror-state prosemirror-transform prosemirror-view`  |


#### @tiptap/starter-kit

| Package manager    | Command                                                                                                    |
| ------------------ | ---------------------------------------------------------------------------------------------------------- |
| Yarn               | `yarn add prosemirror-history prosemirror-dropcursor prosemirror-gapcursor`                                |
| pNPM               | `pnpm install prosemirror-history prosemirror-dropcursor prosemirror-gapcursor`                            |
| npm 6 or less      | `npm install prosemirror-history prosemirror-dropcursor prosemirror-gapcursor`                             |


#### @tiptap/extension-history 

| Package manager    | Command                                                                                                    |
| ------------------ | ---------------------------------------------------------------------------------------------------------- |
| Yarn               | `yarn add prosemirror-history`                                                                             |
| pNPM               | `pnpm install prosemirror-history`                                                                         |
| npm 6 or less      | `npm install prosemirror-history`                                                                          |


#### @tiptap/extension-gapcursor 

| Package manager    | Command                                                                                                    |
| ------------------ | ---------------------------------------------------------------------------------------------------------- |
| Yarn               | `yarn add prosemirror-gapcursor`                                                                           |
| pNPM               | `pnpm install prosemirror-gapcursor`                                                                       |
| npm 6 or less      | `npm install prosemirror-gapcursor`                                                                        |


#### @tiptap/extension-dropcursor 

| Package manager    | Command                                                                                                    |
| ------------------ | ---------------------------------------------------------------------------------------------------------- |
| Yarn               | `yarn add prosemirror-dropcursor`                                                                          |
| pNPM               | `pnpm install prosemirror-dropcursor`                                                                      |
| npm 6 or less      | `npm install prosemirror-dropcursor`                                                                       |


#### @tiptap/extension-collaboration 

| Package manager    | Command                                                                                                    |
| ------------------ | ---------------------------------------------------------------------------------------------------------- |
| Yarn               | `yarn add y-prosemirror`                                                                                   |
| pNPM               | `pnpm install y-prosemirror`                                                                               |
| npm 6 or less      | `npm install y-prosemirror`                                                                                |


#### @tiptap/extension-collaboration-cursor 

| Package manager    | Command                                                                                                    |
| ------------------ | ---------------------------------------------------------------------------------------------------------- |
| Yarn               | `yarn add y-prosemirror`                                                                                   |
| pNPM               | `pnpm install y-prosemirror`                                                                               |
| npm 6 or less      | `npm install y-prosemirror`                                                                                |


:::pro Oops, this is work in progress
A well-written documentation needs attention to detail, a great understanding of the project and time to write.

Though Tiptap is used by thousands of developers all around the world, it’s still a side project for us. Let’s change that and make open source our full-time job! With nearly 300 sponsors we are half way there already.

Join them and become a sponsor! Enable us to put more time into open source and we’ll fill this page and keep it up to date for you.

[Become a sponsor on GitHub →](https://github.com/sponsors/ueberdosis)
:::
