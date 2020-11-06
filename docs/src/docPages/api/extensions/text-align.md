# TextAlign
This extension adds a text align attribute to a specified list of nodes. The attribute is used to align the text.

## Installation
```bash
# with npm
npm install @tiptap/extension-text-align

# with Yarn
yarn add @tiptap/extension-text-align
```

## Settings
| Option           | Type   | Default                                | Description                                                          |
| ---------------- | ------ | -------------------------------------- | -------------------------------------------------------------------- |
| types            | array  | ['heading', 'paragraph']               | A list of nodes where the text align attribute should be applied to. |
| alignments       | array  | ['left', 'center', 'right', 'justify'] | A list of available options for the text align attribute.            |
| defaultAlignment | string | left                                   | The default text align.                                              |

## Commands
| Command   | Parameters | Description                                |
| --------- | ---------- | ------------------------------------------ |
| textAlign | alignment  | Set the text align to the specified value. |

## Keyboard shortcuts
* `Ctrl`&nbsp;`Shift`&nbsp;`L` Left
* `Ctrl`&nbsp;`Shift`&nbsp;`E` Center
* `Ctrl`&nbsp;`Shift`&nbsp;`R` Right
* `Ctrl`&nbsp;`Shift`&nbsp;`J` Justify

## Source code
[packages/extension-text-align/](https://github.com/ueberdosis/tiptap-next/blob/main/packages/extension-text-align/)

## Usage
<demo name="Extensions/TextAlign" highlight="29" />
