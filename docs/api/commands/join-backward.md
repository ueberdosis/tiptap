# joinBackward
The `joinBackward` command joins two nodes backwards from the current selection. If the selection is empty and at the start of a textblock, `joinBackward` will try to reduce the distance between that block and the block before it. [See also](https://prosemirror.net/docs/ref/#commands.joinBackward)

## Usage
```js
editor.commands.joinBackward()
```
