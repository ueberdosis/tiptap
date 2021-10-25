# Suggestion
[![Version](https://img.shields.io/npm/v/@tiptap/suggestion.svg?label=version)](https://www.npmjs.com/package/@tiptap/suggestion)
[![Downloads](https://img.shields.io/npm/dm/@tiptap/suggestion.svg)](https://npmcharts.com/compare/@tiptap/suggestion?minimal=true)

This utility helps with all kinds of suggestions in the editor. Have a look at the [`Mention`](/api/nodes/mention), [`Hashtag`](/api/nodes/hashtag) or [`Emoji`](/api/nodes/emoji) node to see it in action.

## Settings

### char
The character that triggers the autocomplete popup.

Default: `'@'`

### pluginKey
A ProseMirror PluginKey.

Default: `SuggestionPluginKey`

### allowSpaces
Allows or disallows spaces in suggested items.

Default: `false`

### startOfLine
Trigger the autocomplete popup at the start of a line only.

Default: `false`

### decorationTag
The HTML tag that should be rendered for the suggestion.

Default: `'span'`

### decorationClass
A CSS class that should be added to the suggestion.

Default: `'suggestion'`

### command
Executed when a suggestion is selected.

Default: `() => {}'`

### items
Pass an array of filtered suggestions, can be async.

Default: `({ editor, query }) => []`

### render
A render function for the autocomplete popup.

Default: `() => ({})`


## Source code
[packages/suggestion/](https://github.com/ueberdosis/tiptap/blob/main/packages/suggestion/)

