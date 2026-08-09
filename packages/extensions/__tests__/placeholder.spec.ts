import { Editor, getChangedRanges } from '@tiptap/core'
import BulletList from '@tiptap/extension-bullet-list'
import Document from '@tiptap/extension-document'
import ListItem from '@tiptap/extension-list-item'
import Paragraph from '@tiptap/extension-paragraph'
import TaskItem from '@tiptap/extension-task-item'
import TaskList from '@tiptap/extension-task-list'
import Text from '@tiptap/extension-text'
import {
  type PlaceholderOptions,
  Placeholder,
  preparePlaceholderAttribute,
} from '@tiptap/extensions'
import { Node } from '@tiptap/pm/model'
import {
  getTopLevelBlocksInRange,
  toContentRelativeRange,
} from '../src/placeholder/utils/resolveTopLevelRange.js'
import { afterEach, describe, expect, it, vi } from 'vitest'

/** Lets ProseMirror DOMObserver timers settle before teardown. */
function flushView(): Promise<void> {
  return new Promise(resolve => {
    setTimeout(resolve, 30)
  })
}

async function destroyMountedEditor(editor: Editor | null): Promise<void> {
  if (!editor) {
    return
  }

  await flushView()
  editor.destroy()
}

function createHeadlessEditor(content: string) {
  return new Editor({
    element: null,
    extensions: [Document, Paragraph, Text],
    content,
  })
}

describe('extension-placeholder', () => {
  let editor: Editor | null = null

  const createEditor = (placeholderOptions: Partial<PlaceholderOptions>) => {
    if (editor) {
      editor.destroy()
      editor = null
    }

    editor = new Editor({
      extensions: [Document, Paragraph, Text, Placeholder.configure(placeholderOptions)],
      content: '<p></p>',
    })
  }

  afterEach(async () => {
    await destroyMountedEditor(editor)
    editor = null
  })

  it('uses the default data-placeholder attribute when not passing any dataAttribute option', () => {
    createEditor({
      placeholder: 'Type something...',
    })

    const paragraph = editor!.view.dom.querySelector('p') as HTMLElement
    expect(paragraph.getAttribute('data-placeholder')).toBe('Type something...')

    editor!.destroy()
  })

  it('falls back to the default when passing in an empty string', () => {
    createEditor({
      placeholder: 'Type something...',
      dataAttribute: '',
    })

    const paragraph = editor!.view.dom.querySelector('p') as HTMLElement
    expect(paragraph.getAttribute('data-placeholder')).toBe('Type something...')

    editor!.destroy()
  })

  it('uses a custom data-placeholder attribute when passing a dataAttribute option', () => {
    createEditor({
      placeholder: 'Type something...',
      dataAttribute: 'my-placeholder',
    })

    const paragraph = editor!.view.dom.querySelector('p') as HTMLElement
    expect(paragraph.getAttribute('data-my-placeholder')).toBe('Type something...')

    editor!.destroy()
  })

  it('auto-replaces spaces with dashes to keep a valid html element', () => {
    createEditor({
      placeholder: 'Type something...',
      dataAttribute: 'my placeholder',
    })

    const paragraph = editor!.view.dom.querySelector('p') as HTMLElement
    expect(paragraph.getAttribute('data-my-placeholder')).toBe('Type something...')

    editor!.destroy()
  })

  it('auto-repairs an invalid attribute string', () => {
    const brokenAttr = '5 My br0ken $tring'
    createEditor({
      placeholder: 'Type something...',
      dataAttribute: brokenAttr,
    })

    const attributeName = preparePlaceholderAttribute(brokenAttr)
    expect(attributeName).toBe('my-br0ken-tring')

    const paragraph = editor!.view.dom.querySelector('p') as HTMLElement
    expect(paragraph.getAttribute('data-my-br0ken-tring')).toBe('Type something...')

    editor!.destroy()
  })
})
describe('extension-placeholder with includeChildren and wrapper nodes', () => {
  let editor: Editor | null = null

  afterEach(async () => {
    await destroyMountedEditor(editor)
    editor = null
  })

  it('should not show placeholder on non-textblock wrapper nodes (bulletList, listItem)', () => {
    editor = new Editor({
      extensions: [
        Document,
        Paragraph,
        Text,
        BulletList,
        ListItem,
        Placeholder.configure({
          placeholder: 'Type something...',
          includeChildren: true,
        }),
      ],
      content: '<ul><li><p></p></li></ul>',
    })

    const bulletList = editor!.view.dom.querySelector('ul') as HTMLElement
    const listItem = editor!.view.dom.querySelector('li') as HTMLElement
    const paragraph = editor!.view.dom.querySelector('p') as HTMLElement

    // bulletList is not a textblock, so it should NOT have a placeholder
    expect(bulletList.hasAttribute('data-placeholder')).toBe(false)
    // listItem is not a textblock, so it should NOT have a placeholder
    expect(listItem.hasAttribute('data-placeholder')).toBe(false)
    // paragraph is a textblock, so it should have a placeholder
    expect(paragraph.hasAttribute('data-placeholder')).toBe(true)
  })

  it('should not show placeholder on non-textblock nodes for taskList structures', () => {
    editor = new Editor({
      extensions: [
        Document,
        Paragraph,
        Text,
        TaskList,
        TaskItem,
        Placeholder.configure({
          placeholder: 'Type something...',
          includeChildren: true,
        }),
      ],
      content: '<ul data-type="taskList"><li data-type="taskItem"><p></p></li></ul>',
    })

    const taskList = editor!.view.dom.querySelector('ul') as HTMLElement
    const taskItem = editor!.view.dom.querySelector('li') as HTMLElement
    const paragraph = editor!.view.dom.querySelector('p') as HTMLElement

    // taskList is not a textblock, so it should NOT have a placeholder
    expect(taskList.hasAttribute('data-placeholder')).toBe(false)
    // taskItem is not a textblock, so it should NOT have a placeholder
    expect(taskItem.hasAttribute('data-placeholder')).toBe(false)
    // paragraph is a textblock, so it should have a placeholder
    expect(paragraph.hasAttribute('data-placeholder')).toBe(true)
  })

  it('should not show placeholder on non-textblock nodes and not traverse their children when includeChildren is false', () => {
    editor = new Editor({
      extensions: [
        Document,
        Paragraph,
        Text,
        BulletList,
        ListItem,
        Placeholder.configure({
          placeholder: 'Type something...',
          includeChildren: false,
        }),
      ],
      content: '<ul><li><p></p></li></ul>',
    })

    const bulletList = editor!.view.dom.querySelector('ul') as HTMLElement
    const listItem = editor!.view.dom.querySelector('li') as HTMLElement
    const paragraph = editor!.view.dom.querySelector('p') as HTMLElement

    // bulletList is not a textblock, so it should NOT have a placeholder
    // (with the old implementation, bulletList was considered empty and would receive a placeholder)
    expect(bulletList.hasAttribute('data-placeholder')).toBe(false)
    // listItem and paragraph are not traversed because includeChildren is false
    expect(listItem.hasAttribute('data-placeholder')).toBe(false)
    expect(paragraph.hasAttribute('data-placeholder')).toBe(false)
  })
})

describe('extension-placeholder: fast path (default config)', () => {
  let editor: Editor | null = null

  afterEach(async () => {
    await destroyMountedEditor(editor)
    editor = null
  })

  it('shows placeholder in the current empty paragraph via the fast path', () => {
    editor = new Editor({
      extensions: [
        Document,
        Paragraph,
        Text,
        Placeholder.configure({
          placeholder: 'Type something...',
          showOnlyCurrent: true,
          includeChildren: false,
        }),
      ],
      content: '<p></p>',
    })

    const paragraph = editor!.view.dom.querySelector('p') as HTMLElement
    expect(paragraph.getAttribute('data-placeholder')).toBe('Type something...')
    expect(paragraph.classList.contains('is-empty')).toBe(true)
  })

  it('hides placeholder when the cursor is in a non-empty paragraph', () => {
    editor = new Editor({
      extensions: [
        Document,
        Paragraph,
        Text,
        Placeholder.configure({
          placeholder: 'Type something...',
          showOnlyCurrent: true,
          includeChildren: false,
        }),
      ],
      content: '<p>Hello</p>',
    })

    const paragraph = editor!.view.dom.querySelector('p') as HTMLElement
    expect(paragraph.hasAttribute('data-placeholder')).toBe(false)
    expect(paragraph.classList.contains('is-empty')).toBe(false)
  })

  it('shows placeholder only for the current empty node when multiple paragraphs exist', () => {
    editor = new Editor({
      extensions: [
        Document,
        Paragraph,
        Text,
        Placeholder.configure({
          placeholder: 'Write here...',
          showOnlyCurrent: true,
          includeChildren: false,
        }),
      ],
      content: '<p></p><p></p>',
    })

    // Cursor is in the first paragraph by default (start of doc)
    const paragraphs = editor!.view.dom.querySelectorAll('p')
    // Only the first paragraph (where the cursor is) should have a placeholder
    expect(paragraphs[0].getAttribute('data-placeholder')).toBe('Write here...')
    // The second paragraph should not have a placeholder since showOnlyCurrent is true
    expect(paragraphs[1].hasAttribute('data-placeholder')).toBe(false)
  })

  it('removes placeholder when user types into the empty paragraph', () => {
    editor = new Editor({
      extensions: [
        Document,
        Paragraph,
        Text,
        Placeholder.configure({
          placeholder: 'Type something...',
          showOnlyCurrent: true,
          includeChildren: false,
        }),
      ],
      content: '<p></p>',
    })

    const paragraph = editor!.view.dom.querySelector('p') as HTMLElement
    expect(paragraph.getAttribute('data-placeholder')).toBe('Type something...')

    // Insert text into the paragraph
    editor!.commands.insertContent('Hello')
    expect(paragraph.hasAttribute('data-placeholder')).toBe(false)
    expect(paragraph.classList.contains('is-empty')).toBe(false)
  })

  it('shows the placeholder again after selecting all and deleting the content', () => {
    editor = new Editor({
      extensions: [
        Document,
        Paragraph,
        Text,
        Placeholder.configure({
          placeholder: 'Type something...',
          showOnlyCurrent: true,
          includeChildren: false,
        }),
      ],
      content: '<p>Hello world</p>',
    })

    let paragraph = editor!.view.dom.querySelector('p') as HTMLElement
    expect(paragraph.hasAttribute('data-placeholder')).toBe(false)

    // Cmd+A selects the whole document (AllSelection), then delete removes
    // all content, leaving a single empty paragraph.
    editor!.commands.selectAll()
    editor!.commands.deleteSelection()

    paragraph = editor!.view.dom.querySelector('p') as HTMLElement
    expect(editor!.isEmpty).toBe(true)
    expect(paragraph.getAttribute('data-placeholder')).toBe('Type something...')
    expect(paragraph.classList.contains('is-empty')).toBe(true)
  })
})

describe('extension-placeholder: slow path (showOnlyCurrent: false)', () => {
  let editor: Editor | null = null

  afterEach(async () => {
    await destroyMountedEditor(editor)
    editor = null
  })

  it('shows placeholder on all empty textblocks when showOnlyCurrent is false', () => {
    editor = new Editor({
      extensions: [
        Document,
        Paragraph,
        Text,
        Placeholder.configure({
          placeholder: 'Fill me in...',
          showOnlyCurrent: false,
          includeChildren: false,
        }),
      ],
      content: '<p></p><p>Content</p><p></p>',
    })

    const paragraphs = editor!.view.dom.querySelectorAll('p')
    // First paragraph (empty) should have placeholder
    expect(paragraphs[0].getAttribute('data-placeholder')).toBe('Fill me in...')
    // Second paragraph (has content) should not
    expect(paragraphs[1].hasAttribute('data-placeholder')).toBe(false)
    // Third paragraph (empty) should have placeholder
    expect(paragraphs[2].getAttribute('data-placeholder')).toBe('Fill me in...')
  })
})

describe('extension-placeholder — empty editor class', () => {
  let editor: Editor | null = null

  afterEach(async () => {
    await destroyMountedEditor(editor)
    editor = null
  })

  it('adds is-editor-empty class when the entire document is empty', () => {
    editor = new Editor({
      extensions: [Document, Paragraph, Text, Placeholder],
      content: '<p></p>',
    })

    const paragraph = editor!.view.dom.querySelector('p') as HTMLElement
    expect(paragraph.classList.contains('is-editor-empty')).toBe(true)
  })

  it('removes is-editor-empty class when content is added', () => {
    editor = new Editor({
      extensions: [Document, Paragraph, Text, Placeholder],
      content: '<p></p>',
    })

    const paragraph = editor!.view.dom.querySelector('p') as HTMLElement
    expect(paragraph.classList.contains('is-editor-empty')).toBe(true)

    editor!.commands.insertContent('Hello')
    expect(paragraph.classList.contains('is-editor-empty')).toBe(false)
  })

  it('uses custom emptyEditorClass option', () => {
    editor = new Editor({
      extensions: [
        Document,
        Paragraph,
        Text,
        Placeholder.configure({
          emptyEditorClass: 'my-empty-editor',
          emptyNodeClass: 'my-empty-node',
        }),
      ],
      content: '<p></p>',
    })

    const paragraph = editor!.view.dom.querySelector('p') as HTMLElement
    expect(paragraph.classList.contains('my-empty-editor')).toBe(true)
    expect(paragraph.classList.contains('my-empty-node')).toBe(true)
  })

  it('uses emptyNodeClass function to return dynamic class names', () => {
    editor = new Editor({
      extensions: [
        Document,
        Paragraph,
        Text,
        Placeholder.configure({
          emptyNodeClass: ({ node }) => {
            return node.type.name === 'paragraph' ? 'paragraph-empty' : 'other-empty'
          },
        }),
      ],
      content: '<p></p>',
    })

    const paragraph = editor!.view.dom.querySelector('p') as HTMLElement
    expect(paragraph.classList.contains('paragraph-empty')).toBe(true)
    expect(paragraph.classList.contains('other-empty')).toBe(false)
  })
})

describe('placeholder utility: getTopLevelBlocksInRange', () => {
  it('returns content-relative ranges aligned with nodesBetween positions', () => {
    const editor = createHeadlessEditor('<p></p><p></p><p></p>')

    const doc = editor.state.doc
    const nodesBetweenPositions: number[] = []

    doc.nodesBetween(0, doc.content.size, (node, pos) => {
      if (node.type.name === 'paragraph') {
        nodesBetweenPositions.push(pos)
      }
    })

    const blocks = getTopLevelBlocksInRange(doc, 1, 2)

    expect(blocks).toEqual([{ from: 0, to: 2 }])
    expect(blocks[0]?.from).toBe(nodesBetweenPositions[0])

    editor.destroy()
  })

  it('aligns resolveTopLevelRange + toContentRelativeRange with getTopLevelBlocksInRange', () => {
    const editor = createHeadlessEditor('<p></p><p></p><p></p>')

    const doc = editor.state.doc

    doc.forEach((node, offset) => {
      const contentRange = { from: offset, to: offset + node.nodeSize }
      const absoluteRange = { from: offset + 1, to: offset + node.nodeSize + 1 }

      expect(toContentRelativeRange(doc, absoluteRange)).toEqual(contentRange)
      expect(getTopLevelBlocksInRange(doc, absoluteRange.from, absoluteRange.to)).toEqual([
        contentRange,
      ])
    })

    editor.destroy()
  })

  it('collects only the touched top-level block for a single-paragraph edit', () => {
    const editor = createHeadlessEditor('<p></p><p></p><p></p>')

    const changes: Array<{ from: number; to: number }> = []

    editor.on('transaction', ({ transaction }) => {
      if (transaction.docChanged) {
        for (const change of getChangedRanges(transaction)) {
          changes.push(change.newRange)
        }
      }
    })

    editor.commands.insertContent('Hello')

    const doc = editor.state.doc
    const blocks = changes.flatMap(change => getTopLevelBlocksInRange(doc, change.from, change.to))

    expect(blocks).toEqual([{ from: 0, to: 7 }])

    editor.destroy()
  })
})

describe('extension-placeholder: incremental updates (slow path)', () => {
  let editor: Editor | null = null

  const slowPathConfig = {
    placeholder: 'Fill me in...',
    showOnlyCurrent: false,
    includeChildren: true,
    showOnlyWhenEditable: false,
    emptyEditorClass: null as unknown as string,
    emptyNodeClass: null as unknown as string,
    dataAttribute: 'placeholder-text',
  }

  afterEach(async () => {
    await destroyMountedEditor(editor)
    editor = null
  })

  it('shows placeholder on all empty textblocks initially', () => {
    editor = new Editor({
      extensions: [Document, Paragraph, Text, Placeholder.configure(slowPathConfig)],
      content: '<p></p><p></p><p></p>',
    })

    const paragraphs = editor!.view.dom.querySelectorAll('p')
    expect(paragraphs[0].getAttribute('data-placeholder-text')).toBe('Fill me in...')
    expect(paragraphs[1].getAttribute('data-placeholder-text')).toBe('Fill me in...')
    expect(paragraphs[2].getAttribute('data-placeholder-text')).toBe('Fill me in...')
  })

  it('updates function-based placeholder text when selection moves between empty blocks', () => {
    editor = new Editor({
      extensions: [
        Document,
        Paragraph,
        Text,
        Placeholder.configure({
          ...slowPathConfig,
          placeholder: ({ hasAnchor }) => (hasAnchor ? 'Focused' : 'Empty'),
        }),
      ],
      content: '<p></p><p></p>',
    })

    const paragraphs = editor!.view.dom.querySelectorAll('p')

    expect(paragraphs[0].getAttribute('data-placeholder-text')).toBe('Focused')
    expect(paragraphs[1].getAttribute('data-placeholder-text')).toBe('Empty')

    editor!.commands.setTextSelection(4)

    expect(paragraphs[0].getAttribute('data-placeholder-text')).toBe('Empty')
    expect(paragraphs[1].getAttribute('data-placeholder-text')).toBe('Focused')
  })

  it('removes placeholder only for the edited node when typing into one of several empty paragraphs', () => {
    editor = new Editor({
      extensions: [Document, Paragraph, Text, Placeholder.configure(slowPathConfig)],
      content: '<p></p><p></p><p></p>',
    })

    const paragraphs = editor!.view.dom.querySelectorAll('p')

    editor!.commands.insertContent('Hello')

    expect(paragraphs[0].hasAttribute('data-placeholder-text')).toBe(false)
    expect(paragraphs[1].getAttribute('data-placeholder-text')).toBe('Fill me in...')
    expect(paragraphs[2].getAttribute('data-placeholder-text')).toBe('Fill me in...')
  })

  it('preserves decorations on untouched nodes during remote-style edits', () => {
    editor = new Editor({
      extensions: [Document, Paragraph, Text, Placeholder.configure(slowPathConfig)],
      content: '<p></p><p></p><p></p><p></p><p></p>',
    })

    const paragraphs = editor!.view.dom.querySelectorAll('p')

    editor!.commands.insertContentAt(0, 'x')

    expect(paragraphs[1].getAttribute('data-placeholder-text')).toBe('Fill me in...')
    expect(paragraphs[2].getAttribute('data-placeholder-text')).toBe('Fill me in...')
    expect(paragraphs[3].getAttribute('data-placeholder-text')).toBe('Fill me in...')
    expect(paragraphs[4].getAttribute('data-placeholder-text')).toBe('Fill me in...')
  })

  it('adds placeholder when a node becomes empty after deleteSelection', () => {
    editor = new Editor({
      extensions: [Document, Paragraph, Text, Placeholder.configure(slowPathConfig)],
      content: '<p>Hello</p>',
    })

    const paragraph = editor!.view.dom.querySelector('p') as HTMLElement
    expect(paragraph.hasAttribute('data-placeholder-text')).toBe(false)

    editor!.commands.selectAll()
    editor!.commands.deleteSelection()

    expect(paragraph.getAttribute('data-placeholder-text')).toBe('Fill me in...')
  })

  it('correctly updates when a top-level node is split (Enter)', () => {
    editor = new Editor({
      extensions: [Document, Paragraph, Text, Placeholder.configure(slowPathConfig)],
      content: '<p>Hello</p>',
    })

    editor!.commands.setTextSelection(6)
    editor!.commands.splitBlock()

    const paragraphs = editor!.view.dom.querySelectorAll('p')
    expect(paragraphs[0].hasAttribute('data-placeholder-text')).toBe(false)
    expect(paragraphs[1].getAttribute('data-placeholder-text')).toBe('Fill me in...')
  })

  it('correctly updates when two top-level nodes are merged (Backspace)', () => {
    editor = new Editor({
      extensions: [Document, Paragraph, Text, Placeholder.configure(slowPathConfig)],
      content: '<p>Hello</p><p></p>',
    })

    const paragraphs = editor!.view.dom.querySelectorAll('p')
    expect(paragraphs[0].hasAttribute('data-placeholder-text')).toBe(false)
    expect(paragraphs[1].getAttribute('data-placeholder-text')).toBe('Fill me in...')

    editor!.commands.setTextSelection(7)
    editor!.commands.joinBackward()

    const mergedParagraph = editor!.view.dom.querySelector('p') as HTMLElement
    expect(mergedParagraph.hasAttribute('data-placeholder-text')).toBe(false)
  })

  it('does not traverse the full document on incremental update', () => {
    const nodesBetweenSpy = vi.spyOn(Node.prototype, 'nodesBetween')

    editor = new Editor({
      extensions: [Document, Paragraph, Text, Placeholder.configure(slowPathConfig)],
      content: '<p></p>'.repeat(10),
    })

    const docSize = editor!.state.doc.content.size

    nodesBetweenSpy.mockClear()
    editor!.commands.insertContent('Hello')

    expect(nodesBetweenSpy).toHaveBeenCalled()
    expect(nodesBetweenSpy.mock.calls.some(([, from, to]) => from === 0 && to === docSize)).toBe(
      false,
    )

    nodesBetweenSpy.mockRestore()
  })

  it('handles rapid remote edits without losing decorations on untouched nodes', () => {
    editor = new Editor({
      extensions: [Document, Paragraph, Text, Placeholder.configure(slowPathConfig)],
      content: '<p></p><p></p><p></p><p></p><p></p>',
    })

    const paragraphs = editor!.view.dom.querySelectorAll('p')

    for (let i = 0; i < 5; i += 1) {
      editor!.commands.insertContentAt(0, 'x')
    }

    expect(paragraphs[1].getAttribute('data-placeholder-text')).toBe('Fill me in...')
    expect(paragraphs[2].getAttribute('data-placeholder-text')).toBe('Fill me in...')
    expect(paragraphs[3].getAttribute('data-placeholder-text')).toBe('Fill me in...')
    expect(paragraphs[4].getAttribute('data-placeholder-text')).toBe('Fill me in...')
  })
})

describe('extension-placeholder: editable state', () => {
  let editor: Editor | null = null

  afterEach(async () => {
    await destroyMountedEditor(editor)
    editor = null
  })

  it('returns empty decoration set when editor is not editable and showOnlyWhenEditable is true', () => {
    editor = new Editor({
      extensions: [
        Document,
        Paragraph,
        Text,
        Placeholder.configure({
          placeholder: 'Type something...',
          showOnlyCurrent: false,
          showOnlyWhenEditable: true,
        }),
      ],
      content: '<p></p><p></p>',
    })

    const paragraphs = editor!.view.dom.querySelectorAll('p')
    expect(paragraphs[0].hasAttribute('data-placeholder')).toBe(true)

    editor!.setEditable(false)

    expect(paragraphs[0].hasAttribute('data-placeholder')).toBe(false)
    expect(paragraphs[1].hasAttribute('data-placeholder')).toBe(false)
  })

  it('restores decorations when editor becomes editable again', () => {
    editor = new Editor({
      extensions: [
        Document,
        Paragraph,
        Text,
        Placeholder.configure({
          placeholder: 'Type something...',
          showOnlyCurrent: false,
          showOnlyWhenEditable: true,
        }),
      ],
      content: '<p></p><p></p>',
    })

    editor!.setEditable(false)
    editor!.setEditable(true)

    const paragraphs = editor!.view.dom.querySelectorAll('p')
    expect(paragraphs[0].getAttribute('data-placeholder')).toBe('Type something...')
    expect(paragraphs[1].getAttribute('data-placeholder')).toBe('Type something...')
  })
})

describe('extension-placeholder: showOnlyCurrent with includeChildren', () => {
  let editor: Editor | null = null

  afterEach(async () => {
    await destroyMountedEditor(editor)
    editor = null
  })

  it('moves placeholder when cursor moves between empty textblocks', () => {
    editor = new Editor({
      extensions: [
        Document,
        Paragraph,
        Text,
        Placeholder.configure({
          placeholder: 'Write here...',
          showOnlyCurrent: true,
          includeChildren: true,
        }),
      ],
      content: '<p></p><p></p>',
    })

    const paragraphs = editor!.view.dom.querySelectorAll('p')
    expect(paragraphs[0].getAttribute('data-placeholder')).toBe('Write here...')
    expect(paragraphs[1].hasAttribute('data-placeholder')).toBe(false)

    editor!.commands.setTextSelection(4)

    expect(paragraphs[0].hasAttribute('data-placeholder')).toBe(false)
    expect(paragraphs[1].getAttribute('data-placeholder')).toBe('Write here...')
  })
})
