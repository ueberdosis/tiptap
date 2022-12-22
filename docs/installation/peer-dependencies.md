---
tableOfContents: true
---

# Peer dependencies

## Introduction
With the release of version 2.0.0-beta.205 we introduced peer dependencies. Most packages require the installation of peer dependencies.

## Why peer dependencies
In the past it has happened that users installed ProseMirror or Yjs packages, which had a different version than the ones included in Tiptap, to develope their own extensions. This has caused version clashes.

## How to install

### NPM 7 or higher
If you are using NPM 7 or higher, you can ignore the following notes. NPM installs peer dependencies automatically and no further action is required.

### Yarn, pNPM, npm 6 or less

#### @tiptap/core
| Package manager    | Command                                                                                                                                                   |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Yarn               | `yarn add prosemirror-commands prosemirror-keymap prosemirror-model prosemirror-schema-list prosemirror-state prosemirror-transform prosemirror-view`     |
| pNPM               | `pnpm install prosemirror-commands prosemirror-keymap prosemirror-model prosemirror-schema-list prosemirror-state prosemirror-transform prosemirror-view` |
| npm (< 6)          | `npm install prosemirror-commands prosemirror-keymap prosemirror-model prosemirror-schema-list prosemirror-state prosemirror-transform prosemirror-view`  |


#### @tiptap/starter-kit
| Package manager    | Command                                                                                                    |
| ------------------ | ---------------------------------------------------------------------------------------------------------- |
| Yarn               | `yarn add prosemirror-history prosemirror-dropcursor prosemirror-gapcursor`                                |
| pNPM               | `pnpm install prosemirror-history prosemirror-dropcursor prosemirror-gapcursor`                            |
| npm (< 6)          | `npm install prosemirror-history prosemirror-dropcursor prosemirror-gapcursor`                             |


#### @tiptap/vue-2 

| Package manager    | Command                                                                                                    |
| ------------------ | ---------------------------------------------------------------------------------------------------------- |
| Yarn               | `yarn add prosemirror-view`                                                                                |
| pNPM               | `pnpm install prosemirror-view`                                                                            |
| npm (< 6)          | `npm install prosemirror-view`                                                                             |


#### @tiptap/vue-3 

| Package manager    | Command                                                                                                    |
| ------------------ | ---------------------------------------------------------------------------------------------------------- |
| Yarn               | `yarn add prosemirror-state prosemirror-view`                                                              |
| pNPM               | `pnpm install prosemirror-state prosemirror-view`                                                          |
| npm (< 6)          | `npm install prosemirror-state prosemirror-view`                                                           |


#### @tiptap/extension-bubble-menu 

| Package manager    | Command                                                                                                    |
| ------------------ | ---------------------------------------------------------------------------------------------------------- |
| Yarn               | `yarn add prosemirror-state prosemirror-view`                                                              |
| pNPM               | `pnpm install prosemirror-state prosemirror-view`                                                          |
| npm (< 6)          | `npm install prosemirror-state prosemirror-view`                                                           |


#### @tiptap/extension-floating-menu 

| Package manager    | Command                                                                                                    |
| ------------------ | ---------------------------------------------------------------------------------------------------------- |
| Yarn               | `yarn add prosemirror-state prosemirror-view`                                                              |
| pNPM               | `pnpm install prosemirror-state prosemirror-view`                                                          |
| npm (< 6)          | `npm install prosemirror-state prosemirror-view`                                                           |


#### @tiptap/extension-character-count 

| Package manager    | Command                                                                                                    |
| ------------------ | ---------------------------------------------------------------------------------------------------------- |
| Yarn               | `yarn add prosemirror-model prosemirror-state`                                                             |
| pNPM               | `pnpm install prosemirror-model prosemirror-state`                                                         |
| npm (< 6)          | `npm install prosemirror-model prosemirror-state`                                                          |


#### @tiptap/extension-code-block 

| Package manager    | Command                                                                                                    |
| ------------------ | ---------------------------------------------------------------------------------------------------------- |
| Yarn               | `yarn add prosemirror-state`                                                                               |
| pNPM               | `pnpm install prosemirror-state`                                                                           |
| npm (< 6)          | `npm install prosemirror-state`                                                                            |


#### @tiptap/extension-code-block-lowlight 

| Package manager    | Command                                                                                                    |
| ------------------ | ---------------------------------------------------------------------------------------------------------- |
| Yarn               | `yarn add prosemirror-model prosemirror-state prosemirror-view`                                            |
| pNPM               | `pnpm install prosemirror-model prosemirror-state prosemirror-view`                                        |
| npm (< 6)          | `npm install prosemirror-model prosemirror-state prosemirror-view`                                         |


#### @tiptap/extension-horizontal-rule 

| Package manager    | Command                                                                                                    |
| ------------------ | ---------------------------------------------------------------------------------------------------------- |
| Yarn               | `yarn add prosemirror-state`                                                                               |
| pNPM               | `pnpm install prosemirror-state`                                                                           |
| npm (< 6)          | `npm install prosemirror-state`                                                                            |


#### @tiptap/extension-link 

| Package manager    | Command                                                                                                    |
| ------------------ | ---------------------------------------------------------------------------------------------------------- |
| Yarn               | `yarn add prosemirror-model prosemirror-state`                                                             |
| pNPM               | `pnpm install prosemirror-model prosemirror-state`                                                         |
| npm (< 6)          | `npm install prosemirror-model prosemirror-state`                                                          |


#### @tiptap/extension-mention 

| Package manager    | Command                                                                                                    |
| ------------------ | ---------------------------------------------------------------------------------------------------------- |
| Yarn               | `yarn add prosemirror-model prosemirror-state`                                                             |
| pNPM               | `pnpm install prosemirror-model prosemirror-state`                                                         |
| npm (< 6)          | `npm install prosemirror-model prosemirror-state`                                                          |


#### @tiptap/extension-table 

| Package manager    | Command                                                                                                    |
| ------------------ | ---------------------------------------------------------------------------------------------------------- |
| Yarn               | `yarn add prosemirror-model prosemirror-state prosemirror-view`                                            |
| pNPM               | `pnpm install prosemirror-model prosemirror-state prosemirror-view`                                        |
| npm (< 6)          | `npm install prosemirror-model prosemirror-state prosemirror-view`                                         |


#### @tiptap/extension-task-item 

| Package manager    | Command                                                                                                    |
| ------------------ | ---------------------------------------------------------------------------------------------------------- |
| Yarn               | `yarn add prosemirror-model`                                                                               |
| pNPM               | `pnpm install prosemirror-model`                                                                           |
| npm (< 6)          | `npm install prosemirror-model`                                                                            |


#### @tiptap/extension-collaboration 

| Package manager    | Command                                                                                                    |
| ------------------ | ---------------------------------------------------------------------------------------------------------- |
| Yarn               | `yarn add prosemirror-state y-prosemirror`                                                                 |
| pNPM               | `pnpm install prosemirror-state y-prosemirror`                                                             |
| npm (< 6)          | `npm install prosemirror-state y-prosemirror`                                                              |


#### @tiptap/extension-collaboration-cursor 

| Package manager    | Command                                                                                                    |
| ------------------ | ---------------------------------------------------------------------------------------------------------- |
| Yarn               | `yarn add y-prosemirror`                                                                                   |
| pNPM               | `pnpm install y-prosemirror`                                                                               |
| npm (< 6)          | `npm install y-prosemirror`                                                                                |


#### @tiptap/extension-placeholder 

| Package manager    | Command                                                                                                    |
| ------------------ | ---------------------------------------------------------------------------------------------------------- |
| Yarn               | `yarn add prosemirror-model prosemirror-state prosemirror-view`                                            |
| pNPM               | `pnpm install prosemirror-model prosemirror-state prosemirror-view`                                        |
| npm (< 6)          | `npm install prosemirror-model prosemirror-state prosemirror-view`                                         |


#### @tiptap/extension-dropcursor 

| Package manager    | Command                                                                                                    |
| ------------------ | ---------------------------------------------------------------------------------------------------------- |
| Yarn               | `yarn add prosemirror-dropcursor`                                                                          |
| pNPM               | `pnpm install prosemirror-dropcursor`                                                                      |
| npm (< 6)          | `npm install prosemirror-dropcursor`                                                                       |


#### @tiptap/extension-focus 

| Package manager    | Command                                                                                                    |
| ------------------ | ---------------------------------------------------------------------------------------------------------- |
| Yarn               | `yarn add prosemirror-state prosemirror-view`                                                              |
| pNPM               | `pnpm install prosemirror-state prosemirror-view`                                                          |
| npm (< 6)          | `npm install prosemirror-state prosemirror-view`                                                           |


#### @tiptap/extension-gapcursor 

| Package manager    | Command                                                                                                    |
| ------------------ | ---------------------------------------------------------------------------------------------------------- |
| Yarn               | `yarn add prosemirror-gapcursor`                                                                           |
| pNPM               | `pnpm install prosemirror-gapcursor`                                                                       |
| npm (< 6)          | `npm install prosemirror-gapcursor`                                                                        |


#### @tiptap/extension-history 

| Package manager    | Command                                                                                                    |
| ------------------ | ---------------------------------------------------------------------------------------------------------- |
| Yarn               | `yarn add prosemirror-history`                                                                             |
| pNPM               | `pnpm install prosemirror-history`                                                                         |
| npm (< 6)          | `npm install prosemirror-history`                                                                          |


#### @tiptap/suggestion 

| Package manager    | Command                                                                                                    |
| ------------------ | ---------------------------------------------------------------------------------------------------------- |
| Yarn               | `yarn add prosemirror-model prosemirror-state prosemirror-view`                                            |
| pNPM               | `pnpm install prosemirror-model prosemirror-state prosemirror-view`                                        |
| npm (< 6)          | `npm install prosemirror-model prosemirror-state prosemirror-view`                                         |


#### @tiptap/html 

| Package manager    | Command                                                                                                    |
| ------------------ | ---------------------------------------------------------------------------------------------------------- |
| Yarn               | `yarn add prosemirror-model`                                                                               |
| pNPM               | `pnpm install prosemirror-model`                                                                           |
| npm (< 6)          | `npm install prosemirror-model`                                                                            |


:::pro Oops, this is work in progress
A well-written documentation needs attention to detail, a great understanding of the project and time to write.

Though Tiptap is used by thousands of developers all around the world, it’s still a side project for us. Let’s change that and make open source our full-time job! With nearly 300 sponsors we are half way there already.

Join them and become a sponsor! Enable us to put more time into open source and we’ll fill this page and keep it up to date for you.

[Become a sponsor on GitHub →](https://github.com/sponsors/ueberdosis)
:::
