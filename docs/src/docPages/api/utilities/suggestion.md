# Suggestion
[![Version](https://img.shields.io/npm/v/@tiptap/suggestion.svg?label=version)](https://www.npmjs.com/package/@tiptap/suggestion)
[![Downloads](https://img.shields.io/npm/dm/@tiptap/suggestion.svg)](https://npmcharts.com/compare/@tiptap/suggestion?minimal=true)

This utility helps with all kinds of suggestions in the editor. Have a look at the [`Mention`](/api/nodes/mention), [`Hashtag`](/api/nodes/hashtag) or [`Emoji`](/api/nodes/emoji) node to see it in action.

## Settings
| Option          | Type       | Default        | Description                                                 |
| --------------- | ---------- | -------------- | ----------------------------------------------------------- |
| char            | `String`   | `'@'`          | The character that triggers the autocomplete popup.         |
| allowSpaces     | `Boolean`  | `false`        | Allows or disallows spaces in suggested items.              |
| startOfLine     | `Boolean`  | `false`        | Trigger the autocomplete popup at the start of a line only. |
| decorationTag   | `String`   | `'span'`       | The HTML tag that should be rendered for the suggestion.    |
| decorationClass | `String`   | `'suggestion'` | A CSS class that should be added to the suggestion.         |
| command         | `Function` | `() => {}'`    | Executed when a suggestion is selected.                     |
| items           | `Function` | `() => {}`     | Pass an array of filtered suggestions, can be async.        |
| render          | `Function` | `() => ({})`   | A render function for the autocomplete popup.               |

## Source code
[packages/suggestion/](https://github.com/ueberdosis/tiptap/blob/main/packages/suggestion/)

