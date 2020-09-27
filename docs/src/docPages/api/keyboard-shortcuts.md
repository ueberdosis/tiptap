# Keyboard Shortcuts
Keyboard shortcuts may be strings like `'Shift-Control-Enter'`. Keys are based on the strings that can appear in `event.key`, concatenated with a `-`. There is a little tool called [keycode.info](https://keycode.info/), which shows the `event.key` interactively.

Use lowercase letters to refer to letter keys (or uppercase letters if you want shift to be held). You may use `Space` as an alias for the <code>&nbsp;</code>.

Modifiers can be given in any order. `Shift`, `Alt`, `Control` and `Cmd` are recognized. For characters that are created by holding shift, the `Shift` prefix is implied, and should not be added explicitly.

You can use `Mod` as a shorthand for `Cmd` on Mac and `Control` on other platforms.

## Table of Contents

## Overwrite keyboard shortcuts

```js
// 1. Import the extension
import BulletList from '@tiptap/extension-bullet-list'

// 2. Overwrite the keyboard shortcuts
const CustomBulletList = BulletList()
  .keys(({ editor }) => ({
    // ↓ your new keyboard shortcut
    'Mod-l': () => editor.bulletList(),
  }))
  .create() // Don’t forget that!

// 3. Add the custom extension to your editor
new Editor({
  extensions: [
      CustomBulletList(),
      // …
  ]
})
```

## Predefined keyboard shortcuts

### Essentials
| Action                   | Windows/Linux         | macOS             |
| ------------------------ | --------------------- | ----------------- |
| Copy                     | `Control` `C`         | `Cmd` `C`         |
| Cut                      | `Control` `X`         | `Cmd` `X`         |
| Paste                    | `Control` `V`         | `Cmd` `V`         |
| Paste without formatting | `Control` `Shift` `V` | `Cmd` `Shift` `V` |
| Undo                     | `Control` `Z`         | `Cmd` `Z`         |
| Redo                     | `Control` `Shift` `Z` | `Cmd` `Shift` `Z` |
| Insert or edit link      | `Control` `K`         | `Cmd` `K`         |
| Open link                | `Alt` `Enter`         | `Alt` `Enter`     |
| Find                     | `Control` `F`         | `Cmd` `F`         |
| Find and replace         | `Control` `H`         | `Cmd` `Shift` `H` |
| Find again               | `Control` `G`         | `Cmd` `G`         |
| Find previous            | `Control` `Shift` `G` | `Cmd` `Shift` `G` |
| Repeat last action       | `Control` `Y`         | `Cmd` `Y`         |
| Add a line break         | `Shift` `Enter`       | `Shift` `Enter`   |

### Text Formatting
| Action                | Windows/Linux                                 | macOS             |
| --------------------- | --------------------------------------------- | ----------------- |
| Bold                  | `Control` `B`                                 | `Cmd` `B`         |
| Italicize             | `Control` `I`                                 | `Cmd` `I`         |
| Underline             | `Control` `U`                                 | `Cmd` `U`         |
| Strikethrough         | `Alt` `Shift` `5`                             | `Cmd` `Shift` `X` |
| Superscript           | `Control` `.`                                 | `Cmd` `.`         |
| Subscript             | `Control` `,`                                 | `Cmd` `,`         |
| Copy text formatting  | `Control` `Alt` `C`                           | `Cmd` `Alt` `C`   |
| Paste text formatting | `Control` `Alt` `V`                           | `Cmd` `Alt` `V`   |
| Clear text formatting | `Control` <code>\</code><br>`Control` `Space` | `Cmd` `\`         |
| Increase font size    | `Control` `Shift` `>`                         | `Cmd` `Shift` `>` |
| Decrease font size    | `Control` `Shift` `<`                         | `Cmd` `Shift` `<` |

### Paragraph Formatting
| Action                         | Windows/Linux         | macOS                 |
| ------------------------------ | --------------------- | --------------------- |
| Increase paragraph indentation | `Control` `]`         | `Cmd` `]`             |
| Decrease paragraph indentation | `Control` `[`         | `Cmd` `[`             |
| Apply normal text style        | `Control` `Alt` `0`   | `Cmd` `Alt` `0`       |
| Apply heading style 1          | `Control` `Alt` `1`   | `Cmd` `Alt` `1`       |
| Apply heading style 2          | `Control` `Alt` `2`   | `Cmd` `Alt` `2`       |
| Apply heading style 3          | `Control` `Alt` `3`   | `Cmd` `Alt` `3`       |
| Apply heading style 4          | `Control` `Alt` `4`   | `Cmd` `Alt` `4`       |
| Apply heading style 5          | `Control` `Alt` `5`   | `Cmd` `Alt` `5`       |
| Apply heading style 6          | `Control` `Alt` `6`   | `Cmd` `Alt` `6`       |
| Left align                     | `Control` `Shift` `L` | `Cmd` `Shift` `L`     |
| Center align                   | `Control` `Shift` `E` | `Cmd` `Shift` `E`     |
| Right align                    | `Control` `Shift` `R` | `Cmd` `Shift` `R`     |
| Justify                        | `Control` `Shift` `J` | `Cmd` `Shift` `J`     |
| Numbered list                  | `Control` `Shift` `7` | `Cmd` `Shift` `7`     |
| Bulleted list                  | `Control` `Shift` `8` | `Cmd` `Shift` `8`     |
| Move paragraph up              | `Control` `Shift` `↑` | `Control` `Shift` `↑` |
| Move paragraph down            | `Control` `Shift` `↓` | `Control` `Shift` `↓` |

### Text Selection
| Action                                            | Windows/Linux         | macOS             |
| ------------------------------------------------- | --------------------- | ----------------- |
| Select all                                        | `Control` `A`         | `Cmd` `A`         |
| Extend selection one character to left            | `Shift` `←`           | `Shift` `←`       |
| Extend selection one character to right           | `Shift` `→`           | `Shift` `→`       |
| Extend selection one line up                      | `Shift` `↑`           | `Shift` `↑`       |
| Extend selection one line down                    | `Shift` `↓`           | `Shift` `↓`       |
| Extend selection one paragraph up                 | `Alt` `Shift` `↑`     | `Alt` `Shift` `↑` |
| Extend selection one paragraph down               | `Alt` `Shift` `↓`     | `Alt` `Shift` `↓` |
| Extend selection to the beginning of the document | `Control` `Shift` `↑` | `Cmd` `Shift` `↑` |
| Extend selection to the end of the document       | `Control` `Shift` `↓` | `Cmd` `Shift` `↓` |
