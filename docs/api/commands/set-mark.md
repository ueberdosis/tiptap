# setMark
The `setMark` command will add a new mark at the current selection.

## Parameters

`typeOrName: string | MarkType`

The type of a mark to add. Can be a string or a MarkType.

`attributes: Record<string, any>`

The attributes that should be applied to the mark. **This is optional.**

## Usage
```js
editor.commands.setMark("bold", { class: 'bold-tag' })
```
