# Suggestion
TODO

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

## Render
TODO

## Source code
[packages/suggestion/](https://github.com/ueberdosis/tiptap-next/blob/main/packages/suggestion/)

## Usage
* [`Emoji`](/api/nodes/emoji)
* [`Hashtag`](/api/nodes/hashtag)
* [`Mention`](/api/nodes/mention)
