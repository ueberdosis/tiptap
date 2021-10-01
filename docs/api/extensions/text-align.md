# TextAlign
[![Version](https://img.shields.io/npm/v/@tiptap/extension-text-align.svg?label=version)](https://www.npmjs.com/package/@tiptap/extension-text-align)
[![Downloads](https://img.shields.io/npm/dm/@tiptap/extension-text-align.svg)](https://npmcharts.com/compare/@tiptap/extension-text-align?minimal=true)

This extension adds a text align attribute to a specified list of nodes. The attribute is used to align the text.

:::warning Firefox bug
`text-align: justify` doesn't work together with `white-space: pre-wrap` in Firefox, [that’s a known issue](https://bugzilla.mozilla.org/show_bug.cgi?id=1253840).
:::

## Installation
```bash
# with npm
npm install @tiptap/extension-text-align

# with Yarn
yarn add @tiptap/extension-text-align
```

## Settings
| Option           | Type     | Default                                  | Description                                                                                                             |
| ---------------- | -------- | ---------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| types            | `Array`  | `[]`                                     | A list of nodes where the text align attribute should be applied to. Usually something like `['heading', 'paragraph']`. |
| alignments       | `Array`  | `['left', 'center', 'right', 'justify']` | A list of available options for the text align attribute.                                                               |
| defaultAlignment | `String` | `'left'`                                 | The default text align.                                                                                                 |

## Commands
| Command   | Parameters | Description                                |
| --------- | ---------- | ------------------------------------------ |
| textAlign | alignment  | Set the text align to the specified value. |

## Keyboard shortcuts
| Command                 | Windows/Linux                | macOS                       |
| ----------------------- | ---------------------------- | --------------------------- |
| setTextAlign('left')    | `Ctrl`&nbsp;`Shift`&nbsp;`L` | `Cmd`&nbsp;`Shift`&nbsp;`L` |
| setTextAlign('center')  | `Ctrl`&nbsp;`Shift`&nbsp;`E` | `Cmd`&nbsp;`Shift`&nbsp;`E` |
| setTextAlign('right')   | `Ctrl`&nbsp;`Shift`&nbsp;`R` | `Cmd`&nbsp;`Shift`&nbsp;`R` |
| setTextAlign('justify') | `Ctrl`&nbsp;`Shift`&nbsp;`J` | `Cmd`&nbsp;`Shift`&nbsp;`J` |

## Source code
[packages/extension-text-align/](https://github.com/ueberdosis/tiptap/blob/main/packages/extension-text-align/)

## Usage
<tiptap-demo name="Extensions/TextAlign"></tiptap-demo>
