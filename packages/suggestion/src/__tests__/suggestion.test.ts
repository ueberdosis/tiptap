import type { Middleware } from '@floating-ui/dom'
import { Editor, Extension } from '@tiptap/core'
import StarterKit from '@tiptap/starter-kit'
import { describe, expect, it, vi } from 'vitest'

import { exitSuggestion, Suggestion, SuggestionPluginKey } from '../suggestion.js'

describe('suggestion integration', () => {
  it('should respect shouldShow returning false', async () => {
    const shouldShow = vi.fn().mockReturnValue(false)
    const items = vi.fn().mockReturnValue([])
    const render = vi.fn()

    const MentionExtension = Extension.create({
      name: 'mention-false',
      addProseMirrorPlugins() {
        return [
          Suggestion({
            editor: this.editor,
            char: '@',
            shouldShow,
            items,
            render: () => ({
              onStart: render,
              onUpdate: render,
              onExit: render,
            }),
          }),
        ]
      },
    })

    const editor = new Editor({
      extensions: [StarterKit, MentionExtension],
      content: '<p></p>',
    })

    editor.chain().insertContent('@').run()

    // Flush microtasks because plugin view update is async
    await Promise.resolve()

    expect(shouldShow).toHaveBeenCalled()
    expect(render).not.toHaveBeenCalled()

    editor.destroy()
  })

  it('should respect shouldShow returning true', async () => {
    const shouldShow = vi.fn().mockReturnValue(true)
    const render = vi.fn()
    const items = vi.fn().mockReturnValue([])

    const MentionExtension = Extension.create({
      name: 'mention-true',
      addProseMirrorPlugins() {
        return [
          Suggestion({
            editor: this.editor,
            char: '@',
            shouldShow,
            items,
            render: () => ({
              onStart: render,
              onUpdate: render,
              onExit: render,
            }),
          }),
        ]
      },
    })

    const editor = new Editor({
      extensions: [StarterKit, MentionExtension],
      content: '<p></p>',
    })

    editor.chain().insertContent('@').run()

    // Flush microtasks because plugin view update is async
    await Promise.resolve()

    expect(shouldShow).toHaveBeenCalled()
    expect(render).toHaveBeenCalled()

    editor.destroy()
  })

  it('should pass transaction to shouldShow', async () => {
    let capturedProps: any = null
    const shouldShow = vi.fn(props => {
      capturedProps = props
      return true
    })

    const MentionExtension = Extension.create({
      name: 'mention-props',
      addProseMirrorPlugins() {
        return [
          Suggestion({
            editor: this.editor,
            char: '@',
            shouldShow,
          }),
        ]
      },
    })

    const editor = new Editor({
      extensions: [StarterKit, MentionExtension],
      content: '<p></p>',
    })

    editor.chain().insertContent('@').run()

    // Flush microtasks
    await Promise.resolve()

    // The transaction is passed as a flat property
    expect(capturedProps.transaction).toBeDefined()
    expect(capturedProps.query).toBe('')
    expect(capturedProps.text).toBe('@')
    // Check that we receive the correct editor instance
    expect(capturedProps.editor).toBe(editor)

    editor.destroy()
  })
})

describe('suggestion dismissal', () => {
  /** Builds a minimal editor with a single @-mention suggestion and returns helpers. */
  function setup(
    options: {
      allowSpaces?: boolean
      allowToIncludeChar?: boolean
      shouldResetDismissed?: Parameters<typeof Suggestion>[0]['shouldResetDismissed']
    } = {},
  ) {
    const onStart = vi.fn()
    const onUpdate = vi.fn()
    const onExit = vi.fn()

    const MentionExtension = Extension.create({
      name: 'mention-dismiss',
      addProseMirrorPlugins() {
        return [
          Suggestion({
            editor: this.editor,
            char: '@',
            allowSpaces: options.allowSpaces,
            allowToIncludeChar: options.allowToIncludeChar,
            items: () => [],
            shouldResetDismissed: options.shouldResetDismissed,
            render: () => ({ onStart, onUpdate, onExit }),
          }),
        ]
      },
    })

    const editor = new Editor({
      extensions: [StarterKit, MentionExtension],
      content: '<p></p>',
    })

    return { editor, onStart, onUpdate, onExit }
  }

  it('does not re-open the suggestion when the user keeps typing in the same word after dismissal', async () => {
    const { editor, onStart, onUpdate } = setup()

    // Trigger suggestion
    editor.chain().insertContent('@fo').run()
    await Promise.resolve()
    expect(onStart).toHaveBeenCalledTimes(1)

    // Dismiss via exitSuggestion (same as pressing Escape)
    exitSuggestion(editor.view, SuggestionPluginKey)
    await Promise.resolve()

    const startCallsBefore = onStart.mock.calls.length
    const updateCallsBefore = onUpdate.mock.calls.length

    // Keep typing in the same word
    editor.chain().insertContent('o').run()
    await Promise.resolve()

    expect(onStart.mock.calls.length).toBe(startCallsBefore)
    expect(onUpdate.mock.calls.length).toBe(updateCallsBefore)

    editor.destroy()
  })

  it('removes the suggestion decoration when the suggestion is dismissed', async () => {
    const { editor } = setup()

    editor.chain().insertContent('@foo').run()
    await Promise.resolve()

    expect(editor.view.dom.querySelector('.suggestion')).not.toBeNull()

    exitSuggestion(editor.view, SuggestionPluginKey)
    await Promise.resolve()

    expect(editor.view.dom.querySelector('.suggestion')).toBeNull()

    editor.destroy()
  })

  it('removes the suggestion decoration on Escape even when the renderer handles the keydown', async () => {
    const MentionExtension = Extension.create({
      name: 'mention-escape-handled',
      addProseMirrorPlugins() {
        return [
          Suggestion({
            editor: this.editor,
            char: '@',
            items: () => [],
            render: () => ({
              onKeyDown: ({ event }) => event.key === 'Escape',
            }),
          }),
        ]
      },
    })

    const editor = new Editor({
      extensions: [StarterKit, MentionExtension],
      content: '<p></p>',
    })

    editor.chain().insertContent('@foo').run()
    await Promise.resolve()

    expect(editor.view.dom.querySelector('.suggestion')).not.toBeNull()

    editor.view.someProp('handleKeyDown', f =>
      f(editor.view, new KeyboardEvent('keydown', { key: 'Escape' })),
    )
    await Promise.resolve()

    expect(editor.view.dom.querySelector('.suggestion')).toBeNull()

    editor.destroy()
  })

  it('keeps the suggestion decoration removed while dismissal is being preserved', async () => {
    const { editor } = setup({ allowSpaces: true })

    editor.chain().insertContent('@foo').run()
    await Promise.resolve()

    exitSuggestion(editor.view, SuggestionPluginKey)
    await Promise.resolve()

    editor.chain().insertContent(' bar').run()
    await Promise.resolve()

    expect(editor.view.dom.querySelector('.suggestion')).toBeNull()

    editor.destroy()
  })

  it('re-opens the suggestion after a space is inserted following dismissal', async () => {
    const { editor, onStart } = setup()

    // Trigger and dismiss
    editor.chain().insertContent('@foo').run()
    await Promise.resolve()
    exitSuggestion(editor.view, SuggestionPluginKey)
    await Promise.resolve()

    const startCallsBefore = onStart.mock.calls.length

    // Space clears dismissed state; typing a new @ afterwards should open suggestion
    editor.chain().insertContent(' @').run()
    await Promise.resolve()

    expect(onStart.mock.calls.length).toBeGreaterThan(startCallsBefore)

    editor.destroy()
  })

  it('re-opens the suggestion after a newline is inserted following dismissal', async () => {
    const { editor, onStart } = setup()

    // Trigger and dismiss
    editor.chain().insertContent('@foo').run()
    await Promise.resolve()
    exitSuggestion(editor.view, SuggestionPluginKey)
    await Promise.resolve()

    const startCallsBefore = onStart.mock.calls.length

    // Newline clears dismissed state; typing a new @ afterwards should open suggestion
    editor.commands.enter()
    await Promise.resolve()
    editor.chain().insertContent('@').run()
    await Promise.resolve()

    expect(onStart.mock.calls.length).toBeGreaterThan(startCallsBefore)

    editor.destroy()
  })

  it('keeps the suggestion dismissed across spaces when allowSpaces is enabled', async () => {
    const { editor, onStart, onUpdate } = setup({ allowSpaces: true })

    editor.chain().insertContent('@foo').run()
    await Promise.resolve()
    expect(onStart).toHaveBeenCalledTimes(1)

    exitSuggestion(editor.view, SuggestionPluginKey)
    await Promise.resolve()

    const startCallsBefore = onStart.mock.calls.length
    const updateCallsBefore = onUpdate.mock.calls.length

    editor.chain().insertContent(' bar').run()
    await Promise.resolve()

    expect(onStart.mock.calls.length).toBe(startCallsBefore)
    expect(onUpdate.mock.calls.length).toBe(updateCallsBefore)

    editor.destroy()
  })

  it('does not treat spaces as part of the dismissed context when allowToIncludeChar disables allowSpaces', async () => {
    const { editor, onStart } = setup({ allowSpaces: true, allowToIncludeChar: true })

    editor.chain().insertContent('@foo').run()
    await Promise.resolve()
    expect(onStart).toHaveBeenCalledTimes(1)

    exitSuggestion(editor.view, SuggestionPluginKey)
    await Promise.resolve()

    const startCallsBefore = onStart.mock.calls.length

    editor.chain().insertContent(' @').run()
    await Promise.resolve()

    expect(onStart.mock.calls.length).toBeGreaterThan(startCallsBefore)

    editor.destroy()
  })

  it('re-opens the suggestion when the trigger char is deleted and retyped', async () => {
    const { editor, onStart } = setup()

    // Trigger and dismiss
    editor.chain().insertContent('@').run()
    await Promise.resolve()
    exitSuggestion(editor.view, SuggestionPluginKey)
    await Promise.resolve()

    const startCallsBefore = onStart.mock.calls.length

    // Delete the @ — cursor leaves trigger context, dismissedFrom clears
    editor.commands.deleteRange({ from: 1, to: 2 })
    await Promise.resolve()

    // Retype @
    editor.chain().insertContent('@').run()
    await Promise.resolve()

    expect(onStart.mock.calls.length).toBeGreaterThan(startCallsBefore)

    editor.destroy()
  })

  it('re-opens the suggestion when a different trigger is typed elsewhere', async () => {
    const { editor, onStart } = setup()

    // Trigger and dismiss at first @
    editor.chain().insertContent('@foo').run()
    await Promise.resolve()
    exitSuggestion(editor.view, SuggestionPluginKey)
    await Promise.resolve()

    const startCallsBefore = onStart.mock.calls.length

    // Move to a new word and type a fresh @
    editor.chain().insertContent(' @').run()
    await Promise.resolve()

    expect(onStart.mock.calls.length).toBeGreaterThan(startCallsBefore)

    editor.destroy()
  })

  it('allows consumers to reset the dismissed context manually', async () => {
    const shouldResetDismissed = vi.fn(({ transaction }) =>
      transaction.doc.textBetween(0, transaction.doc.content.size, '\n').includes('.'),
    )
    const { editor, onStart } = setup({ shouldResetDismissed })

    editor.chain().insertContent('@foo').run()
    await Promise.resolve()
    exitSuggestion(editor.view, SuggestionPluginKey)
    await Promise.resolve()

    const startCallsBefore = onStart.mock.calls.length

    editor.chain().insertContent('.').run()
    await Promise.resolve()

    expect(shouldResetDismissed).toHaveBeenCalled()
    expect(onStart.mock.calls.length).toBeGreaterThan(startCallsBefore)

    editor.destroy()
  })
})

describe('suggestion minQueryLength', () => {
  it('should not call items when query is shorter than minQueryLength', async () => {
    const items = vi.fn().mockReturnValue([])
    const onStart = vi.fn()
    const onUpdate = vi.fn()
    const onExit = vi.fn()

    const MentionExtension = Extension.create({
      name: 'mention-min-query',
      addProseMirrorPlugins() {
        return [
          Suggestion({
            editor: this.editor,
            char: '@',
            minQueryLength: 2,
            items,
            render: () => ({ onStart, onUpdate, onExit }),
          }),
        ]
      },
    })

    const editor = new Editor({
      extensions: [StarterKit, MentionExtension],
      content: '<p></p>',
    })

    // Type @a — query "a" is too short (length 1 < 2)
    editor.chain().insertContent('@a').run()
    await Promise.resolve()

    expect(onStart).toHaveBeenCalledTimes(1)
    // items should not have been called because query.length < minQueryLength
    expect(items).not.toHaveBeenCalled()
    // The props passed to onStart should have items: []
    expect(onStart).toHaveBeenCalledWith(expect.objectContaining({ items: [] }))

    // Continue typing to reach minQueryLength
    editor.chain().insertContent('b').run()
    await Promise.resolve()

    // items should be called now with query 'ab'
    expect(items).toHaveBeenCalledWith(
      expect.objectContaining({
        editor: expect.any(Object),
        query: 'ab',
      }),
    )

    editor.destroy()
  })
})

describe('suggestion initialItems', () => {
  it('should pass initialItems to onBeforeStart/onBeforeUpdate and resolved items to onStart/onUpdate', async () => {
    const initialItems = [{ id: 1, label: 'Popular' }]
    const resolvedItems = [{ id: 2, label: 'Filtered' }]
    const items = vi.fn().mockResolvedValue(resolvedItems)
    const onBeforeStart = vi.fn()
    const onBeforeUpdate = vi.fn()
    const onStart = vi.fn()
    const onUpdate = vi.fn()
    const onExit = vi.fn()

    const MentionExtension = Extension.create({
      name: 'mention-initial-items',
      addProseMirrorPlugins() {
        return [
          Suggestion({
            editor: this.editor,
            char: '@',
            initialItems,
            items,
            render: () => ({ onBeforeStart, onBeforeUpdate, onStart, onUpdate, onExit }),
          }),
        ]
      },
    })

    const editor = new Editor({
      extensions: [StarterKit, MentionExtension],
      content: '<p></p>',
    })

    // Type @ to start suggestion
    editor.chain().insertContent('@').run()
    await Promise.resolve()
    await Promise.resolve()

    // onBeforeStart should receive initialItems
    expect(onBeforeStart).toHaveBeenCalledWith(expect.objectContaining({ items: initialItems }))
    // onStart mounts immediately with the initial items while loading
    expect(onStart).toHaveBeenLastCalledWith(
      expect.objectContaining({ items: initialItems, loading: true }),
    )
    // onUpdate receives the async-resolved items
    expect(onUpdate).toHaveBeenLastCalledWith(expect.objectContaining({ items: resolvedItems }))
    // items() should still have been called
    expect(items).toHaveBeenCalledWith(
      expect.objectContaining({
        editor: expect.any(Object),
        query: '',
      }),
    )

    // Reset mocks for the update phase
    items.mockClear()
    onBeforeUpdate.mockClear()
    onUpdate.mockClear()

    // Type another character to trigger an update
    editor.chain().insertContent('a').run()
    await Promise.resolve()
    await Promise.resolve()

    // onBeforeUpdate should also receive initialItems
    expect(onBeforeUpdate).toHaveBeenCalledWith(expect.objectContaining({ items: initialItems }))
    // onUpdate should receive the async-resolved items
    expect(onUpdate).toHaveBeenLastCalledWith(expect.objectContaining({ items: resolvedItems }))
    expect(items).toHaveBeenCalledWith(
      expect.objectContaining({
        editor: expect.any(Object),
        query: 'a',
      }),
    )

    editor.destroy()
  })
})

describe('suggestion loading state', () => {
  it('should set loading to true in before callbacks and false after when items() is called', async () => {
    const items = vi.fn().mockResolvedValue([])
    const onBeforeStart = vi.fn()
    const onBeforeUpdate = vi.fn()
    const onStart = vi.fn()
    const onUpdate = vi.fn()
    const onExit = vi.fn()

    const MentionExtension = Extension.create({
      name: 'mention-loading',
      addProseMirrorPlugins() {
        return [
          Suggestion({
            editor: this.editor,
            char: '@',
            items,
            render: () => ({ onBeforeStart, onBeforeUpdate, onStart, onUpdate, onExit }),
          }),
        ]
      },
    })

    const editor = new Editor({
      extensions: [StarterKit, MentionExtension],
      content: '<p></p>',
    })

    // Type @ to start suggestion — triggers async items()
    editor.chain().insertContent('@').run()
    await Promise.resolve()
    await Promise.resolve()

    // onBeforeStart fires before items() resolves → loading should be true
    expect(onBeforeStart).toHaveBeenCalledWith(expect.objectContaining({ loading: true }))
    // onStart fires immediately with loading enabled
    expect(onStart).toHaveBeenLastCalledWith(expect.objectContaining({ loading: true }))
    // onUpdate fires after items() resolves → loading should be false
    expect(onUpdate).toHaveBeenLastCalledWith(expect.objectContaining({ loading: false }))

    // Type another char to trigger an update
    editor.chain().insertContent('a').run()
    await Promise.resolve()
    await Promise.resolve()

    // onBeforeUpdate fires before items() resolves → loading should be true
    expect(onBeforeUpdate).toHaveBeenCalledWith(expect.objectContaining({ loading: true }))
    // onUpdate fires after items() resolves → loading should be false
    expect(onUpdate).toHaveBeenLastCalledWith(expect.objectContaining({ loading: false }))

    editor.destroy()
  })

  it('should recover when items() rejects', async () => {
    const items = vi.fn().mockRejectedValue(new Error('boom'))
    const onBeforeStart = vi.fn()
    const onUpdate = vi.fn()
    const onStart = vi.fn()

    const MentionExtension = Extension.create({
      name: 'mention-loading-rejects',
      addProseMirrorPlugins() {
        return [
          Suggestion({
            editor: this.editor,
            char: '@',
            items,
            render: () => ({ onBeforeStart, onStart, onUpdate }),
          }),
        ]
      },
    })

    const editor = new Editor({
      extensions: [StarterKit, MentionExtension],
      content: '<p></p>',
    })

    editor.chain().insertContent('@').run()
    await Promise.resolve()
    await Promise.resolve()

    expect(items).toHaveBeenCalledTimes(1)
    expect(onBeforeStart).toHaveBeenCalledWith(expect.objectContaining({ loading: true }))
    expect(onUpdate).toHaveBeenLastCalledWith(expect.objectContaining({ loading: false }))

    editor.destroy()
  })

  it('should set loading to false in all callbacks when minQueryLength blocks items()', async () => {
    const items = vi.fn().mockResolvedValue([])
    const onBeforeStart = vi.fn()
    const onStart = vi.fn()

    const MentionExtension = Extension.create({
      name: 'mention-loading-blocked',
      addProseMirrorPlugins() {
        return [
          Suggestion({
            editor: this.editor,
            char: '@',
            minQueryLength: 3,
            items,
            render: () => ({ onBeforeStart, onStart }),
          }),
        ]
      },
    })

    const editor = new Editor({
      extensions: [StarterKit, MentionExtension],
      content: '<p></p>',
    })

    // Type @a — query "a" is too short, items() won't be called
    editor.chain().insertContent('@a').run()
    await Promise.resolve()

    // No async call happens → loading should be false
    expect(onBeforeStart).toHaveBeenCalledWith(expect.objectContaining({ loading: false }))
    expect(onStart).toHaveBeenCalledWith(expect.objectContaining({ loading: false }))

    editor.destroy()
  })
})

describe('suggestion AbortSignal', () => {
  it('should pass signal to items() and abort previous signal on new query', async () => {
    const signals: AbortSignal[] = []
    let resolveFirst: (value: unknown) => void = () => {}

    const items = vi.fn().mockImplementation(({ signal }) => {
      signals.push(signal)
      // First call returns a promise that we control
      if (signals.length === 1) {
        return new Promise(resolve => {
          resolveFirst = resolve
        })
      }
      // Subsequent calls resolve immediately
      return []
    })

    const onStart = vi.fn()
    const onUpdate = vi.fn()

    const MentionExtension = Extension.create({
      name: 'mention-abort',
      addProseMirrorPlugins() {
        return [
          Suggestion({
            editor: this.editor,
            char: '@',
            items,
            render: () => ({ onStart, onUpdate }),
          }),
        ]
      },
    })

    const editor = new Editor({
      extensions: [StarterKit, MentionExtension],
      content: '<p></p>',
    })

    // Type @ to start suggestion — first items() call starts but doesn't resolve
    editor.chain().insertContent('@').run()
    await Promise.resolve()

    expect(items).toHaveBeenCalledTimes(1)
    expect(signals[0].aborted).toBe(false)

    // Type a — triggers a second items() while first is still in-flight
    editor.chain().insertContent('a').run()
    await Promise.resolve()

    // items() should have been called a second time
    expect(items).toHaveBeenCalledTimes(2)
    // The first signal should be aborted
    expect(signals[0].aborted).toBe(true)
    // The second signal should be fresh
    expect(signals[1].aborted).toBe(false)

    // Clean up the hanging promise
    resolveFirst([])
    await Promise.resolve()

    editor.destroy()
  })

  it('should not emit stale callbacks after a request is superseded', async () => {
    const signals: AbortSignal[] = []
    let resolveFirst: (value: unknown) => void = () => {}

    const items = vi.fn().mockImplementation(({ signal }) => {
      signals.push(signal)

      if (signals.length === 1) {
        return new Promise(resolve => {
          resolveFirst = resolve
        })
      }

      return []
    })

    const onStart = vi.fn()
    const onUpdate = vi.fn()

    const MentionExtension = Extension.create({
      name: 'mention-abort-stale-callbacks',
      addProseMirrorPlugins() {
        return [
          Suggestion({
            editor: this.editor,
            char: '@',
            items,
            render: () => ({ onStart, onUpdate }),
          }),
        ]
      },
    })

    const editor = new Editor({
      extensions: [StarterKit, MentionExtension],
      content: '<p></p>',
    })

    editor.chain().insertContent('@').run()
    await Promise.resolve()

    editor.chain().insertContent('a').run()
    await Promise.resolve()
    await Promise.resolve()

    const startCallsBefore = onStart.mock.calls.length
    const updateCallsBefore = onUpdate.mock.calls.length

    resolveFirst([])
    await Promise.resolve()
    await Promise.resolve()

    expect(onStart.mock.calls.length).toBe(startCallsBefore)
    expect(onUpdate.mock.calls.length).toBe(updateCallsBefore)

    editor.destroy()
  })

  it('should pass signal as a property in the items callback props', async () => {
    const items = vi.fn().mockImplementation(({ signal }) => {
      expect(signal).toBeInstanceOf(AbortSignal)
      return []
    })

    const MentionExtension = Extension.create({
      name: 'mention-abort-prop',
      addProseMirrorPlugins() {
        return [
          Suggestion({
            editor: this.editor,
            char: '@',
            items,
          }),
        ]
      },
    })

    const editor = new Editor({
      extensions: [StarterKit, MentionExtension],
      content: '<p></p>',
    })

    editor.chain().insertContent('@').run()
    await Promise.resolve()

    expect(items).toHaveBeenCalled()
    // The callback assertion already checked signal is an AbortSignal

    editor.destroy()
  })
})

describe('suggestion debounce', () => {
  it('should delay the items() call by the configured debounce time', async () => {
    vi.useFakeTimers()

    const items = vi.fn().mockResolvedValue([])
    const onBeforeStart = vi.fn()
    const onStart = vi.fn()

    const MentionExtension = Extension.create({
      name: 'mention-debounce',
      addProseMirrorPlugins() {
        return [
          Suggestion({
            editor: this.editor,
            char: '@',
            debounce: 100,
            items,
            render: () => ({ onBeforeStart, onStart }),
          }),
        ]
      },
    })

    const editor = new Editor({
      extensions: [StarterKit, MentionExtension],
      content: '<p></p>',
    })

    // Type @ to trigger suggestion
    editor.chain().insertContent('@').run()

    // items() should not have been called yet (debounce pending)
    expect(items).not.toHaveBeenCalled()
    // onBeforeStart should fire immediately (not debounced)
    expect(onBeforeStart).toHaveBeenCalled()

    // Advance past the debounce window
    await vi.advanceTimersByTimeAsync(100)

    // Now items() should have been called
    expect(items).toHaveBeenCalledTimes(1)
    // onStart fires after items resolves
    expect(onStart).toHaveBeenCalled()

    vi.useRealTimers()
    editor.destroy()
  })

  it('should cancel pending debounce work on destroy', async () => {
    vi.useFakeTimers()

    const items = vi.fn().mockResolvedValue([])
    const onBeforeStart = vi.fn()
    const onStart = vi.fn()

    const MentionExtension = Extension.create({
      name: 'mention-debounce-destroy',
      addProseMirrorPlugins() {
        return [
          Suggestion({
            editor: this.editor,
            char: '@',
            debounce: 100,
            items,
            render: () => ({ onBeforeStart, onStart }),
          }),
        ]
      },
    })

    const editor = new Editor({
      extensions: [StarterKit, MentionExtension],
      content: '<p></p>',
    })

    editor.chain().insertContent('@').run()
    await Promise.resolve()

    expect(onBeforeStart).toHaveBeenCalledWith(expect.objectContaining({ loading: true }))

    const startCallsBefore = onStart.mock.calls.length

    editor.destroy()
    await vi.advanceTimersByTimeAsync(100)

    expect(items).not.toHaveBeenCalled()
    expect(onStart.mock.calls.length).toBe(startCallsBefore)

    vi.useRealTimers()
  })

  it('should reset the debounce timer on rapid typing', async () => {
    vi.useFakeTimers()

    const items = vi.fn().mockResolvedValue([])

    const MentionExtension = Extension.create({
      name: 'mention-debounce-rapid',
      addProseMirrorPlugins() {
        return [
          Suggestion({
            editor: this.editor,
            char: '@',
            debounce: 100,
            items,
          }),
        ]
      },
    })

    const editor = new Editor({
      extensions: [StarterKit, MentionExtension],
      content: '<p></p>',
    })

    // Type @a
    editor.chain().insertContent('@a').run()
    await vi.advanceTimersByTimeAsync(60)

    // Type b before debounce fires
    editor.chain().insertContent('b').run()
    await vi.advanceTimersByTimeAsync(60)

    // Debounce should have reset — items not called yet
    expect(items).not.toHaveBeenCalled()

    // Advance past remaining debounce from last keystroke
    await vi.advanceTimersByTimeAsync(100)

    // Should have been called only once (not twice)
    expect(items).toHaveBeenCalledTimes(1)

    vi.useRealTimers()
    editor.destroy()
  })
})

describe('suggestion positioning options', () => {
  it('should forward placement, offset, container, and flip to SuggestionProps', async () => {
    const onStart = vi.fn()

    const MentionExtension = Extension.create({
      name: 'mention-positioning',
      addProseMirrorPlugins() {
        return [
          Suggestion({
            editor: this.editor,
            char: '@',
            placement: 'top-start',
            offset: { mainAxis: 8, crossAxis: 4 },
            container: '.my-container',
            flip: false,
            render: () => ({ onStart }),
          }),
        ]
      },
    })

    const editor = new Editor({
      extensions: [StarterKit, MentionExtension],
      content: '<p></p>',
    })

    editor.chain().insertContent('@').run()
    await Promise.resolve()

    expect(onStart).toHaveBeenCalledWith(
      expect.objectContaining({
        placement: 'top-start',
        offset: { mainAxis: 8, crossAxis: 4 },
        container: '.my-container',
        flip: false,
      }),
    )

    editor.destroy()
  })

  it('should use defaults when positioning options are not set', async () => {
    const onStart = vi.fn()

    const MentionExtension = Extension.create({
      name: 'mention-positioning-defaults',
      addProseMirrorPlugins() {
        return [
          Suggestion({
            editor: this.editor,
            char: '@',
            render: () => ({ onStart }),
          }),
        ]
      },
    })

    const editor = new Editor({
      extensions: [StarterKit, MentionExtension],
      content: '<p></p>',
    })

    editor.chain().insertContent('@').run()
    await Promise.resolve()

    expect(onStart).toHaveBeenCalledWith(
      expect.objectContaining({
        placement: 'bottom-start',
        offset: { mainAxis: 4, crossAxis: 0 },
        flip: true,
      }),
    )

    editor.destroy()
  })

  it('should pass through floatingUi config and middleware', async () => {
    const customMiddleware = {
      name: 'custom',
      fn: vi.fn(() => ({ x: 0, y: 0 })),
    } as Middleware

    const onStart = vi.fn()

    const MentionExtension = Extension.create({
      name: 'mention-floating-ui',
      addProseMirrorPlugins() {
        return [
          Suggestion({
            editor: this.editor,
            char: '@',
            placement: 'top-start',
            offset: { mainAxis: 8, crossAxis: 4 },
            flip: false,
            floatingUi: {
              strategy: 'fixed',
              middleware: [customMiddleware],
            },
            render: () => ({ onStart }),
          }),
        ]
      },
    })

    const editor = new Editor({
      extensions: [StarterKit, MentionExtension],
      content: '<p></p>',
    })

    editor.chain().insertContent('@').run()
    await Promise.resolve()

    expect(onStart).toHaveBeenCalledWith(
      expect.objectContaining({
        floatingUi: expect.objectContaining({
          placement: 'top-start',
          strategy: 'fixed',
        }),
      }),
    )

    const floatingUi = onStart.mock.calls[0][0].floatingUi
    expect(floatingUi.middleware).toHaveLength(2)
    expect(floatingUi.middleware).toEqual(expect.arrayContaining([customMiddleware]))

    editor.destroy()
  })
})

describe('suggestion mount', () => {
  // Captures `props.mount` from a started suggestion so each test can call it
  // against a real element.
  async function getMount(container?: string | HTMLElement) {
    const onStart = vi.fn()

    const MentionExtension = Extension.create({
      name: 'mention-mount',
      addProseMirrorPlugins() {
        return [
          Suggestion({
            editor: this.editor,
            char: '@',
            container,
            render: () => ({ onStart }),
          }),
        ]
      },
    })

    const editor = new Editor({
      extensions: [StarterKit, MentionExtension],
      content: '<p></p>',
    })

    editor.chain().insertContent('@').run()
    await Promise.resolve()

    return { mount: onStart.mock.calls[0][0].mount, editor }
  }

  it('mounts the element into document.body and removes it on unmount', async () => {
    const { mount, editor } = await getMount()
    const element = document.createElement('div')

    const unmount = mount(element)
    expect(element.parentElement).toBe(document.body)

    unmount()
    expect(element.isConnected).toBe(false)

    editor.destroy()
  })

  it('mounts the element into a provided container', async () => {
    const container = document.createElement('div')
    document.body.appendChild(container)

    const { mount, editor } = await getMount(container)
    const element = document.createElement('div')

    const unmount = mount(element)
    expect(element.parentElement).toBe(container)

    unmount()
    container.remove()
    editor.destroy()
  })

  it('leaves an already-mounted element in place (escape hatch)', async () => {
    const { mount, editor } = await getMount()
    const element = document.createElement('div')
    const host = document.createElement('div')
    host.appendChild(element)
    document.body.appendChild(host)

    const unmount = mount(element)
    expect(element.parentElement).toBe(host)

    // We did not mount it, so unmount must not remove it.
    unmount()
    expect(element.parentElement).toBe(host)

    host.remove()
    editor.destroy()
  })
})

describe('suggestion outside click', () => {
  async function setup(dismissOnOutsideClick?: boolean) {
    const onStart = vi.fn()

    const MentionExtension = Extension.create({
      name: 'mention-outside-click',
      addProseMirrorPlugins() {
        return [
          Suggestion({
            editor: this.editor,
            char: '@',
            dismissOnOutsideClick,
            render: () => ({ onStart }),
          }),
        ]
      },
    })

    const editor = new Editor({
      extensions: [StarterKit, MentionExtension],
      content: '<p></p>',
    })

    editor.chain().insertContent('@').run()
    await Promise.resolve()

    const mount = onStart.mock.calls[0][0].mount
    const isActive = () => SuggestionPluginKey.getState(editor.state)?.active === true

    return { mount, editor, isActive }
  }

  it('dismisses when clicking outside the popup and editor', async () => {
    const { mount, editor, isActive } = await setup()
    const element = document.createElement('div')
    const unmount = mount(element)

    expect(isActive()).toBe(true)

    const outside = document.createElement('div')
    document.body.appendChild(outside)
    outside.dispatchEvent(new Event('pointerdown', { bubbles: true }))

    expect(isActive()).toBe(false)

    unmount()
    outside.remove()
    editor.destroy()
  })

  it('does not dismiss when clicking inside the popup', async () => {
    const { mount, editor, isActive } = await setup()
    const element = document.createElement('div')
    const unmount = mount(element)

    element.dispatchEvent(new Event('pointerdown', { bubbles: true }))

    expect(isActive()).toBe(true)

    unmount()
    editor.destroy()
  })

  it('does not attach the listener when dismissOnOutsideClick is false', async () => {
    const { mount, editor, isActive } = await setup(false)
    const element = document.createElement('div')
    const unmount = mount(element)

    const outside = document.createElement('div')
    document.body.appendChild(outside)
    outside.dispatchEvent(new Event('pointerdown', { bubbles: true }))

    expect(isActive()).toBe(true)

    unmount()
    outside.remove()
    editor.destroy()
  })
})
