# Configure tiptap

In its basic version tiptap comes very raw. There is no menu, no buttons, no styling. That’s intended. See tiptap as your building blocks to build exactly the editor you’d like to have.

## Adding a menu

Let’s start to add your first button to the editor.

<demo name="SimpleMenuBar" highlight="5-11" />

Once initiated the editor has a powerful API. So called commands allow you to modify the text. In this example `this.editor.bold` marks the selected text bold. There a ton of other commands (see the [list of available commands](/commands/)) and you can even chain them to do multiple things at once.

For most use cases you want to

## Configure extensions

You are free to choose which parts of tiptap you want to use. Tiptap has support for different nodes (paragraphs, blockquotes, tables and many more) and different marks (bold, italic, links). If you want to explicitly configure what kind of nodes and marks are allowed and which are not allowed, you can configure those.

Note that `Document`, `Paragraph` and `Text` are required. Otherwise you won’t be able to add any plain text.

<demo name="ExtensionConfiguration" highlight="10-13,30-33" />

That’s also the place where you can register custom extensions, which you or someone else built for tiptap.

## Related links

* List of all available Commands
* List of all available Extensions
* Build custom Extensions