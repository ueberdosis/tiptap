# Heading
Enables you to use headline HTML tags in the editor.

## Options
| Option | Type   | Default            | Description                                  |
| ------ | ------ | ------------------ | -------------------------------------------- |
| class  | string | –                  | Add a custom class to the rendered HTML tag. |
| levels | Array  | [1, 2, 3, 4, 5, 6] | Specifies which headlines are supported.     |

## Commands
| Command | Options | Description             |
| ------- | ------- | ----------------------- |
| heading | level   | Creates a heading node. |

## Keyboard shortcuts
* `Control` + `Shift` + `1` → H1
* `Control` + `Shift` + `2` → H2
* `Control` + `Shift` + `3` → H3
* `Control` + `Shift` + `4` → H4
* `Control` + `Shift` + `5` → H5
* `Control` + `Shift` + `6` → H6

## Source Code
[packages/extension-heading/](https://github.com/ueberdosis/tiptap-next/blob/main/packages/extension-heading/)

## Usage
<demo name="Extensions/Heading" highlight="" />
