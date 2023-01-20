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
