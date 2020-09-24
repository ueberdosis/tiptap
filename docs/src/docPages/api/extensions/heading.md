# Heading
The Heading extension adds support for headings of different levels. Headings are rendered with `<h1>`, `<h2>`, `<h3>`, `<h4>`, `<h5>` or `<h6>` HTML tags. By default all six headline levels are enabled, but you can pass an array to only allow a few levels. Check the usage example to see how this is done.

Type <code>#&nbsp;</code> at the beginning of a new line and it will magically transform to a headline, same for <code>##&nbsp;</code>, <code>###&nbsp;</code>, <code>####&nbsp;</code>, <code>#####&nbsp;</code> and <code>######&nbsp;</code>.

## Installation
```bash
# With npm
npm install @tiptap/extension-heading

# Or: With Yarn
yarn add @tiptap/extension-heading
```

## Settings
| Option | Type   | Default            | Description                                  |
| ------ | ------ | ------------------ | -------------------------------------------- |
| class  | string | –                  | Add a custom class to the rendered HTML tag. |
| levels | Array  | [1, 2, 3, 4, 5, 6] | Specifies which headlines are supported.     |

## Commands
| Command | Options | Description             |
| ------- | ------- | ----------------------- |
| heading | level   | Creates a heading node. |

## Keyboard shortcuts
* `Control ` `Shift ` `1` → H1
* `Control ` `Shift ` `2` → H2
* `Control ` `Shift ` `3` → H3
* `Control ` `Shift ` `4` → H4
* `Control ` `Shift ` `5` → H5
* `Control ` `Shift ` `6` → H6

## Source code
[packages/extension-heading/](https://github.com/ueberdosis/tiptap-next/blob/main/packages/extension-heading/)

## Usage
<demo name="Extensions/Heading" highlight="3-11,23,42-44" />
