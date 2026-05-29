import { Editor } from '@tiptap/core'
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
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { findScrollParent } from '../src/placeholder/utils/findScrollParent.js'
import { throttle } from '../src/placeholder/utils/throttle.js'

import { PLUGIN_KEY } from '../src/placeholder/constants.js'

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

  afterEach(() => {
    if (editor) {
      editor.destroy()
    }
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

  afterEach(() => {
    if (editor) {
      editor.destroy()
    }
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

  afterEach(() => {
    if (editor) {
      editor.destroy()
      editor = null
    }
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

  it('does not dispatch a viewport recompute synchronously on doc change (defers to rAF)', () => {
    editor = new Editor({
      extensions: [
        Document,
        Paragraph,
        Text,
        Placeholder.configure({
          showOnlyCurrent: false,
          includeChildren: false,
        }),
      ],
      content: '<p></p>'.repeat(20),
    })

    const dispatch = vi.spyOn(editor!.view, 'dispatch')

    // Trigger a doc size change — the old code called computeAndDispatch()
    // synchronously from the update() callback, which dispatched a second
    // transaction with PLUGIN_KEY meta. The fix defers to rAF instead.
    editor!.commands.insertContent('Hello World')

    const viewportRecomputes = dispatch.mock.calls.filter(
      ([tr]) => tr.getMeta(PLUGIN_KEY) !== undefined,
    )
    expect(viewportRecomputes).toHaveLength(0)

    dispatch.mockRestore()
  })
})

describe('extension-placeholder: slow path (showOnlyCurrent: false)', () => {
  let editor: Editor | null = null

  afterEach(() => {
    if (editor) {
      editor.destroy()
      editor = null
    }
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

  afterEach(() => {
    if (editor) {
      editor.destroy()
      editor = null
    }
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

describe('placeholder utility: findScrollParent', () => {
  let container: HTMLElement

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  afterEach(() => {
    document.body.removeChild(container)
  })

  it('returns the window when no scroll parent exists', () => {
    const el = document.createElement('span')
    container.appendChild(el)
    expect(findScrollParent(el)).toBe(window)
  })

  it('finds a scrollable parent element with overflow: auto', () => {
    const scrollable = document.createElement('div')
    scrollable.style.overflow = 'auto'
    const child = document.createElement('span')
    scrollable.appendChild(child)
    container.appendChild(scrollable)

    expect(findScrollParent(child)).toBe(scrollable)
  })

  it('finds a scrollable parent element with overflow: scroll', () => {
    const scrollable = document.createElement('div')
    scrollable.style.overflow = 'scroll'
    const child = document.createElement('span')
    scrollable.appendChild(child)
    container.appendChild(scrollable)

    expect(findScrollParent(child)).toBe(scrollable)
  })

  it('does not return elements with overflow: hidden or overflow: clip', () => {
    const hidden = document.createElement('div')
    hidden.style.overflow = 'hidden'
    const clip = document.createElement('div')
    clip.style.overflow = 'clip'
    const child = document.createElement('span')
    hidden.appendChild(clip)
    clip.appendChild(child)
    container.appendChild(hidden)

    expect(findScrollParent(child)).toBe(window)
  })

  it('finds the nearest scrollable ancestor', () => {
    const outer = document.createElement('div')
    outer.style.overflow = 'scroll'
    const middle = document.createElement('div')
    middle.style.overflow = 'hidden'
    const child = document.createElement('span')
    middle.appendChild(child)
    outer.appendChild(middle)
    container.appendChild(outer)

    // Should find `outer`, not stop at `middle` (which is hidden, not scrollable)
    expect(findScrollParent(child)).toBe(outer)
  })
})

describe('placeholder utility: throttle', () => {
  it('calls the function immediately on the first invocation (leading-edge)', () => {
    let called = false
    const { call } = throttle(() => {
      called = true
    }, 250)
    call()
    expect(called).toBe(true)
  })

  it('ignores subsequent calls within the delay window', () => {
    let count = 0
    const { call } = throttle(() => {
      count += 1
    }, 250)

    call()
    call()
    call()
    // Leading-edge fires immediately, subsequent calls within the delay are blocked
    expect(count).toBe(1)
  })

  it('allows a call after the delay has elapsed', () => {
    vi.useFakeTimers()
    let count = 0
    const { call } = throttle(() => {
      count += 1
    }, 250)

    call()
    expect(count).toBe(1)

    vi.advanceTimersByTime(250)
    call()
    expect(count).toBe(2)
    vi.useRealTimers()
  })

  it('resets the timer on each call within the window', () => {
    vi.useFakeTimers()
    let count = 0
    const { call } = throttle(() => {
      count += 1
    }, 250)

    call() // fires immediately
    expect(count).toBe(1)

    vi.advanceTimersByTime(100)
    call() // ignored (within 250ms window)
    vi.advanceTimersByTime(100)
    call() // ignored
    vi.advanceTimersByTime(100)
    // 300ms elapsed total, but the window extends 250ms from the last call
    expect(count).toBe(1)

    vi.advanceTimersByTime(150)
    call() // 250ms has passed since last call
    expect(count).toBe(2)
    vi.useRealTimers()
  })

  it('cancel() clears the timer and allows immediate re-call', () => {
    vi.useFakeTimers()
    let count = 0
    const { call, cancel } = throttle(() => {
      count += 1
    }, 250)

    call() // fires, starts timer
    expect(count).toBe(1)

    cancel() // clears timer
    call() // fires again because timer was cancelled
    expect(count).toBe(2)
    vi.useRealTimers()
  })
})
