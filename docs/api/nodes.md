---
tableOfContents: true
---

# Nodes

## Introduction
If you think of the document as a tree, then nodes are just a type of content in that tree. Examples of nodes are paragraphs, headings, or code blocks. But nodes don’t have to be blocks. They can also be rendered inline with the text, for example for **@mentions**.

## List of supported nodes
| Title                                        | StarterKit ([view](/api/extensions/starter-kit)) | Source Code                                                                                  |
| -------------------------------------------- | ------------------------------------------------ | -------------------------------------------------------------------------------------------- |
| [Blockquote](/api/nodes/blockquote)          | Included                                         | [GitHub](https://github.com/ueberdosis/tiptap/blob/main/packages/extension-blockquote/)      |
| [BulletList](/api/nodes/bullet-list)         | Included                                         | [GitHub](https://github.com/ueberdosis/tiptap/blob/main/packages/extension-bullet-list/)     |
| [CodeBlock](/api/nodes/code-block)           | Included                                         | [GitHub](https://github.com/ueberdosis/tiptap/blob/main/packages/extension-code-block/)      |
| [Details](/api/nodes/details)                | –                                                | Requires a Tiptap Pro subscription                                                           |
| [DetailsSummary](/api/nodes/details-summary) | –                                                | Requires a Tiptap Pro subscription                                                           |
| [DetailsContent](/api/nodes/details-content) | –                                                | Requires a Tiptap Pro subscription                                                           |
| [Document](/api/nodes/document)              | Included                                         | [GitHub](https://github.com/ueberdosis/tiptap/blob/main/packages/extension-document/)        |
| [Emoji](/api/nodes/emoji)                    | –                                                | Requires a Tiptap Pro subscription                                                           |
| [HardBreak](/api/nodes/hard-break)           | Included                                         | [GitHub](https://github.com/ueberdosis/tiptap/blob/main/packages/extension-hard-break/)      |
| [Heading](/api/nodes/heading)                | Included                                         | [GitHub](https://github.com/ueberdosis/tiptap/blob/main/packages/extension-heading/)         |
| [HorizontalRule](/api/nodes/horizontal-rule) | Included                                         | [GitHub](https://github.com/ueberdosis/tiptap/blob/main/packages/extension-horizontal-rule/) |
| [Image](/api/nodes/image)                    | –                                                | [GitHub](https://github.com/ueberdosis/tiptap/blob/main/packages/extension-image/)           |
| [ListItem](/api/nodes/list-item)             | Included                                         | [GitHub](https://github.com/ueberdosis/tiptap/blob/main/packages/extension-list-item/)       |
| [Mention](/api/nodes/mention)                | Included                                         | [GitHub](https://github.com/ueberdosis/tiptap/blob/main/packages/extension-mention/)         |
| [OrderedList](/api/nodes/ordered-list)       | Included                                         | [GitHub](https://github.com/ueberdosis/tiptap/blob/main/packages/extension-ordered-list/)    |
| [Paragraph](/api/nodes/paragraph)            | Included                                         | [GitHub](https://github.com/ueberdosis/tiptap/blob/main/packages/extension-paragraph/)       |
| [Table](/api/nodes/table)                    | –                                                | [GitHub](https://github.com/ueberdosis/tiptap/blob/main/packages/extension-table/)           |
| [TableRow](/api/nodes/table-row)             | –                                                | [GitHub](https://github.com/ueberdosis/tiptap/blob/main/packages/extension-table-row/)       |
| [TableCell](/api/nodes/table-cell)           | –                                                | [GitHub](https://github.com/ueberdosis/tiptap/blob/main/packages/extension-table-cell/)      |
| [TaskList](/api/nodes/task-list)             | –                                                | [GitHub](https://github.com/ueberdosis/tiptap/blob/main/packages/extension-task-list/)       |
| [TaskItem](/api/nodes/task-item)             | –                                                | [GitHub](https://github.com/ueberdosis/tiptap/blob/main/packages/extension-task-item/)       |
| [Text](/api/nodes/text)                      | Included                                         | [GitHub](https://github.com/ueberdosis/tiptap/blob/main/packages/extension-text/)            |
| [YouTube](/api/nodes/youtube)                | –                                                | [GitHub](https://github.com/ueberdosis/tiptap/blob/main/packages/extension-youtube/)         |

## Create a new node
You’re free to create your own nodes for Tiptap. Here is the boilerplate code that’s need to create and register your own node:

```js
import { Node } from '@tiptap/core'

const CustomNode = Node.create({
  // Your code here
})

const editor = new Editor({
  extensions: [
    // Register your custom node with the editor.
    CustomNode,
    // … and don’t forget all other extensions.
    Document,
    Paragraph,
    Text,
    // …
  ],
})
```

Learn [more about custom extensions in our guide](/guide/custom-extensions).
