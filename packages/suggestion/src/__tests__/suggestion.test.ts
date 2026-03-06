import { Editor, Extension } from '@tiptap/core'
import StarterKit from '@tiptap/starter-kit'
import { describe, expect, it, vi } from 'vitest'

import { exitSuggestion,Suggestion, SuggestionPluginKey } from '../suggestion.js'

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
  function setup() {
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
            items: () => [],
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
})
