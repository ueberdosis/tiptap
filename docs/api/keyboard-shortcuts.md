---
tableOfContents: true
---

# Keyboard Shortcuts

## toc

## Introduction
tiptap comes with sensible keyboard shortcut defaults. Depending on what you want to use it for, you’ll probably want to change those keyboard shortcuts to your liking. Let’s have a look at what we defined for you, and show you how to change it then!

Funfact: We built a [keyboard shortcut learning app](https://mouseless.app), to which we manually added exercises for thousands of keyboard shortcuts for a bunch of tools.

## Predefined keyboard shortcuts
Most of the core extensions register their own keyboard shortcuts. Depending on what set of extension you use, not all of the below listed keyboard shortcuts work for your editor.

### Essentials
| Action                   | Windows/Linux                   | macOS                       |
| ------------------------ | ------------------------------- | --------------------------- |
| Copy                     | `Control`&nbsp;`C`              | `Cmd`&nbsp;`C`              |
| Cut                      | `Control`&nbsp;`X`              | `Cmd`&nbsp;`X`              |
| Paste                    | `Control`&nbsp;`V`              | `Cmd`&nbsp;`V`              |
| Paste without formatting | `Control`&nbsp;`Shift`&nbsp;`V` | `Cmd`&nbsp;`Shift`&nbsp;`V` |
| Undo                     | `Control`&nbsp;`Z`              | `Cmd`&nbsp;`Z`              |
| Redo                     | `Control`&nbsp;`Shift`&nbsp;`Z` | `Cmd`&nbsp;`Shift`&nbsp;`Z` |
| Add a line break         | `Shift`&nbsp;`Enter`            | `Shift`&nbsp;`Enter`        |

### Text Formatting
| Action        | Windows/Linux                   | macOS                       |
| ------------- | ------------------------------- | --------------------------- |
| Bold          | `Control`&nbsp;`B`              | `Cmd`&nbsp;`B`              |
| Italicize     | `Control`&nbsp;`I`              | `Cmd`&nbsp;`I`              |
| Underline     | `Control`&nbsp;`U`              | `Cmd`&nbsp;`U`              |
| Strikethrough | `Control`&nbsp;`Shift`&nbsp;`X` | `Cmd`&nbsp;`Shift`&nbsp;`X` |
| Highlight     | `Control`&nbsp;`Shift`&nbsp;`H` | `Cmd`&nbsp;`Shift`&nbsp;`H` |
| Code          | `Control`&nbsp;`E`              | `Cmd`&nbsp;`E`              |

### Paragraph Formatting
| Action                  | Windows/Linux                   | macOS                       |
| ----------------------- | ------------------------------- | --------------------------- |
| Apply normal text style | `Control`&nbsp;`Alt`&nbsp;`0`   | `Cmd`&nbsp;`Alt`&nbsp;`0`   |
| Apply heading style 1   | `Control`&nbsp;`Alt`&nbsp;`1`   | `Cmd`&nbsp;`Alt`&nbsp;`1`   |
| Apply heading style 2   | `Control`&nbsp;`Alt`&nbsp;`2`   | `Cmd`&nbsp;`Alt`&nbsp;`2`   |
| Apply heading style 3   | `Control`&nbsp;`Alt`&nbsp;`3`   | `Cmd`&nbsp;`Alt`&nbsp;`3`   |
| Apply heading style 4   | `Control`&nbsp;`Alt`&nbsp;`4`   | `Cmd`&nbsp;`Alt`&nbsp;`4`   |
| Apply heading style 5   | `Control`&nbsp;`Alt`&nbsp;`5`   | `Cmd`&nbsp;`Alt`&nbsp;`5`   |
| Apply heading style 6   | `Control`&nbsp;`Alt`&nbsp;`6`   | `Cmd`&nbsp;`Alt`&nbsp;`6`   |
| Ordered list            | `Control`&nbsp;`Shift`&nbsp;`7` | `Cmd`&nbsp;`Shift`&nbsp;`7` |
| Bullet list             | `Control`&nbsp;`Shift`&nbsp;`8` | `Cmd`&nbsp;`Shift`&nbsp;`8` |
| Task list               | `Control`&nbsp;`Shift`&nbsp;`9` | `Cmd`&nbsp;`Shift`&nbsp;`9` |
| Blockquote              | `Control`&nbsp;`Shift`&nbsp;`B` | `Cmd`&nbsp;`Shift`&nbsp;`B` |
| Left align              | `Control`&nbsp;`Shift`&nbsp;`L` | `Cmd`&nbsp;`Shift`&nbsp;`L` |
| Center align            | `Control`&nbsp;`Shift`&nbsp;`E` | `Cmd`&nbsp;`Shift`&nbsp;`E` |
| Right align             | `Control`&nbsp;`Shift`&nbsp;`R` | `Cmd`&nbsp;`Shift`&nbsp;`R` |
| Justify                 | `Control`&nbsp;`Shift`&nbsp;`J` | `Cmd`&nbsp;`Shift`&nbsp;`J` |
| Code block              | `Control`&nbsp;`Alt`&nbsp;`C`   | `Cmd`&nbsp;`Alt`&nbsp;`C`   |
| Subscript               | `Control`&nbsp;`,`              | `Cmd`&nbsp;`,`              |
| Superscript             | `Control`&nbsp;`.`              | `Cmd`&nbsp;`.`              |

<!--| Toggle task| `Control`&nbsp;`Enter` | `Cmd`&nbsp;`Enter` | -->

### Text Selection
| Action                                            | Windows/Linux                   | macOS                       |
| ------------------------------------------------- | ------------------------------- | --------------------------- |
| Select all                                        | `Control`&nbsp;`A`              | `Cmd`&nbsp;`A`              |
| Extend selection one character to left            | `Shift`&nbsp;`←`                | `Shift`&nbsp;`←`            |
| Extend selection one character to right           | `Shift`&nbsp;`→`                | `Shift`&nbsp;`→`            |
| Extend selection one line up                      | `Shift`&nbsp;`↑`                | `Shift`&nbsp;`↑`            |
| Extend selection one line down                    | `Shift`&nbsp;`↓`                | `Shift`&nbsp;`↓`            |
| Extend selection to the beginning of the document | `Control`&nbsp;`Shift`&nbsp;`↑` | `Cmd`&nbsp;`Shift`&nbsp;`↑` |
| Extend selection to the end of the document       | `Control`&nbsp;`Shift`&nbsp;`↓` | `Cmd`&nbsp;`Shift`&nbsp;`↓` |

## Overwrite keyboard shortcuts
Keyboard shortcuts may be strings like `'Shift-Control-Enter'`. Keys are based on the strings that can appear in `event.key`, concatenated with a `-`. There is a little tool called [keycode.info](https://keycode.info/), which shows the `event.key` interactively.

Use lowercase letters to refer to letter keys (or uppercase letters if you want shift to be held). You may use `Space` as an alias for the <code>&nbsp;</code>.

Modifiers can be given in any order. `Shift`, `Alt`, `Control` and `Cmd` are recognized. For characters that are created by holding shift, the `Shift` prefix is implied, and should not be added explicitly.

You can use `Mod` as a shorthand for `Cmd` on Mac and `Control` on other platforms.

Here is an example how you can overwrite the keyboard shortcuts for an existing extension:

```js
// 1. Import the extension
import BulletList from '@tiptap/extension-bullet-list'

// 2. Overwrite the keyboard shortcuts
const CustomBulletList = BulletList.extend({
  addKeyboardShortcuts() {
    return {
      // ↓ your new keyboard shortcut
      'Mod-l': () => this.editor.commands.toggleBulletList(),
    }
  },
})

// 3. Add the custom extension to your editor
new Editor({
  extensions: [
    CustomBulletList(),
    // …
  ],
})
```
