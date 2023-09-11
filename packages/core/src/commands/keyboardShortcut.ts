import { RawCommands } from '../types.js'
import { isiOS } from '../utilities/isiOS.js'
import { isMacOS } from '../utilities/isMacOS.js'

function normalizeKeyName(name: string) {
  const parts = name.split(/-(?!$)/)
  let result = parts[parts.length - 1]

  if (result === 'Space') {
    result = ' '
  }

  let alt
  let ctrl
  let shift
  let meta

  for (let i = 0; i < parts.length - 1; i += 1) {
    const mod = parts[i]

    if (/^(cmd|meta|m)$/i.test(mod)) {
      meta = true
    } else if (/^a(lt)?$/i.test(mod)) {
      alt = true
    } else if (/^(c|ctrl|control)$/i.test(mod)) {
      ctrl = true
    } else if (/^s(hift)?$/i.test(mod)) {
      shift = true
    } else if (/^mod$/i.test(mod)) {
      if (isiOS() || isMacOS()) {
        meta = true
      } else {
        ctrl = true
      }
    } else {
      throw new Error(`Unrecognized modifier name: ${mod}`)
    }
  }

  if (alt) {
    result = `Alt-${result}`
  }

  if (ctrl) {
    result = `Ctrl-${result}`
  }

  if (meta) {
    result = `Meta-${result}`
  }

  if (shift) {
    result = `Shift-${result}`
  }

  return result
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    keyboardShortcut: {
      /**
       * Trigger a keyboard shortcut.
       * @param name The name of the keyboard shortcut.
       * @example editor.commands.keyboardShortcut('Mod-b')
       */
      keyboardShortcut: (name: string) => ReturnType,
    }
  }
}

export const keyboardShortcut: RawCommands['keyboardShortcut'] = name => ({
  editor,
  view,
  tr,
  dispatch,
}) => {
  const keys = normalizeKeyName(name).split(/-(?!$)/)
  const key = keys.find(item => !['Alt', 'Ctrl', 'Meta', 'Shift'].includes(item))
  const event = new KeyboardEvent('keydown', {
    key: key === 'Space'
      ? ' '
      : key,
    altKey: keys.includes('Alt'),
    ctrlKey: keys.includes('Ctrl'),
    metaKey: keys.includes('Meta'),
    shiftKey: keys.includes('Shift'),
    bubbles: true,
    cancelable: true,
  })

  const capturedTransaction = editor.captureTransaction(() => {
    view.someProp('handleKeyDown', f => f(view, event))
  })

  capturedTransaction?.steps.forEach(step => {
    const newStep = step.map(tr.mapping)

    if (newStep && dispatch) {
      tr.maybeStep(newStep)
    }
  })

  return true
}
