# Typography
[![Version](https://img.shields.io/npm/v/@tiptap/extension-typography.svg?label=version)](https://www.npmjs.com/package/@tiptap/extension-typography)
[![Downloads](https://img.shields.io/npm/dm/@tiptap/extension-typography.svg)](https://npmcharts.com/compare/@tiptap/extension-typography?minimal=true)

This extension tries to help with common text patterns with the correct typographic character. Under the hood all rules are input rules.

## Installation
```bash
# with npm
npm install @tiptap/extension-typography

# with Yarn
yarn add @tiptap/extension-typography
```

## Rules
| Name                | Description                                                                             |
| ------------------- | --------------------------------------------------------------------------------------- |
| emDash              | Converts double dashes `--` to an emdash `—`.                                           |
| ellipsis            | Converts three dots `...` to an ellipsis character `…`                                  |
| openDoubleQuote     | `“`Smart” opening double quotes.                                                        |
| closeDoubleQuote    | “Smart`”` closing double quotes.                                                        |
| openSingleQuote     | `‘`Smart’ opening single quotes.                                                        |
| closeSingleQuote    | ‘Smart`’` closing single quotes.                                                        |
| leftArrow           | Converts <code><&dash;</code> to an arrow `←` .                                         |
| rightArrow          | Converts <code>&dash;></code> to an arrow `→`.                                          |
| copyright           | Converts `(c)` to a copyright sign `©`.                                                 |
| registeredTrademark | Converts `(r)` to registered trademark sign `®`.                                        |
| trademark           | Converts `(tm)` to registered trademark sign `™`.                                       |
| oneHalf             | Converts `1/2` to one half `½`.                                                         |
| oneQuarter          | Converts `1/4` to one quarter `¼`.                                                      |
| threeQuarters       | Converts `3/4` to three quarters `¾`.                                                   |
| plusMinus           | Converts `+/-` to plus/minus sign `±`.                                                  |
| notEqual            | Converts <code style="font-variant-ligatures: none;">!=</code> to a not equal sign `≠`. |
| laquo               | Converts `<<` to left-pointing double angle quotation mark `«`.                         |
| raquo               | Converts `>>` to right-pointing double angle quotation mark `»`.                        |
| multiplication      | Converts `2 * 3` or `2x3` to a multiplcation sign `2×3`.                                |
| superscriptTwo      | Converts `^2` a superscript two `²`.                                                    |
| superscriptThree    | Converts `^3` a superscript three `³`.                                                  |

## Keyboard shortcuts
| Command         | Windows/Linux | macOS       |
| --------------- | ------------- | ----------- |
| undoInputRule() | `Backspace`   | `Backspace` |

## Source code
[packages/extension-typography/](https://github.com/ueberdosis/tiptap/blob/main/packages/extension-typography/)

## Usage
<tiptap-demo name="Extensions/Typography"></tiptap-demo>
