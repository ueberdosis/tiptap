# Configuration

In its simplest version tiptap comes very raw. There is no menu, no buttons, no styling. That’s intended. See tiptap as your building blocks to build exactly the editor you would like to have.

## Adding a menu

Let’s start to add your first button to the editor. Once initiated the editor has a powerful API. The so called *commands* allow you to modify selected text (and tons of other things). Here is an example with one single button:

<demo name="SimpleMenuBar" highlight="5-11" />

To mark selected text bold we can use `this.editor.bold`. There a ton of other commands and you can even chain them to do multiple things at once.

You might wonder what features tiptap supports out of the box. In the above example we added the `@tiptap/starter-kit`. That already includes support for paragraphs, text, bold, italic, inline code and code blocks. There are a lot more, but you have to explicitly import them. You will learn how that works in the next example.

### Related Links

* [List of available commands](/api/commands)

## Configure extensions

You are free to choose which parts of tiptap you want to use. Tiptap has support for different nodes (paragraphs, blockquotes, tables and many more) and different marks (bold, italic, links). If you want to explicitly configure what kind of nodes and marks are allowed and which are not allowed, you can configure those.

Note that `Document`, `Paragraph` and `Text` are required. Otherwise you won’t be able to add any plain text.

<demo name="ExtensionConfiguration" highlight="10-13,30-33" />

That’s also the place where you can register custom extensions, which you or someone else built for tiptap.

### Related links

* [List of available commands](/api/commands)
* [List of available extensions](/api/extensions)
* Build custom extensions

## Difference between nodes and marks

tiptap used a JSON schema under the hood. Every part of the text is stored as a specific type. There is a `Document` type (it’s needed, but invisible – like the `<body>` in HTML).

*Nodes* are like blocks of content, for example a paragraph or a headline. Yes, this paragraph is a node.

*Marks* can apply a different style to parts of text inside a node. A good example is **bold text**. That’s a mark. *Italic*, `inline code` or [links](#) are marks too.

### Related links

* [Learn more about the schema](/api/schema)
* [List of available extensions](/api/extensions)