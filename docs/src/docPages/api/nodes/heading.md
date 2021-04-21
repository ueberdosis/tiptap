# Heading
[![Version](https://img.shields.io/npm/v/@tiptap/extension-heading.svg?label=version)](https://www.npmjs.com/package/@tiptap/extension-heading)
[![Downloads](https://img.shields.io/npm/dm/@tiptap/extension-heading.svg)](https://npmcharts.com/compare/@tiptap/extension-heading?minimal=true)

The Heading extension adds support for headings of different levels. Headings are rendered with `<h1>`, `<h2>`, `<h3>`, `<h4>`, `<h5>` or `<h6>` HTML tags. By default all six heading levels (or styles) are enabled, but you can pass an array to only allow a few levels. Check the usage example to see how this is done.

Type <code>#&nbsp;</code> at the beginning of a new line and it will magically transform to a heading, same for <code>##&nbsp;</code>, <code>###&nbsp;</code>, <code>####&nbsp;</code>, <code>#####&nbsp;</code> and <code>######&nbsp;</code>.

## Installation
```bash
# with npm
npm install @tiptap/extension-heading

# with Yarn
yarn add @tiptap/extension-heading
```

## Settings
| Option         | Type     | Default              | Description                                                           |
| -------------- | -------- | -------------------- | --------------------------------------------------------------------- |
| HTMLAttributes | `Object` | `{}`                 | Custom HTML attributes that should be added to the rendered HTML tag. |
| levels         | `Array`  | `[1, 2, 3, 4, 5, 6]` | Specifies which heading levels are supported.                         |

## Commands
| Command | Parameters | Description                                      |
| ------- | ---------- | ------------------------------------------------ |
| heading | level      | Creates a heading node with the specified level. |

## Keyboard shortcuts
* Windows/Linux: `Control`&nbsp;`Alt`&nbsp;`1-6`
* macOS: `Cmd`&nbsp;`Alt`&nbsp;`1-6`

## Source code
[packages/extension-heading/](https://github.com/ueberdosis/tiptap-next/blob/main/packages/extension-heading/)

## Usage
<demo name="Nodes/Heading" highlight="3-11,23,42-44" />
