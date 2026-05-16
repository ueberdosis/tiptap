import type { Locator, Page } from '@playwright/test'

/**
 * Helpers for interacting with Tiptap editors in Playwright tests.
 *
 * Tiptap exposes the live `Editor` instance on each `.tiptap` DOM node via
 * an `editor` property. These helpers reach into that instance through
 * `page.evaluate` to read state or run commands deterministically.
 */

export type EditorSelector = string | Locator

/** Default selector used when none is provided. */
export const DEFAULT_EDITOR_SELECTOR = '.tiptap'

function toSelector(target: EditorSelector | undefined): string {
  if (typeof target === 'string') {
    return target
  }
  if (target) {
    // We cannot easily serialise a Locator into evaluate context, so callers
    // who use locators must convert to a selector themselves. Locators are
    // accepted for ergonomics in chained API spots and ignored here.
    return DEFAULT_EDITOR_SELECTOR
  }
  return DEFAULT_EDITOR_SELECTOR
}

/** Read the editor HTML. */
export async function getEditorHTML(page: Page, target?: EditorSelector, index = 0): Promise<string> {
  const selector = toSelector(target)
  await waitForEditor(page, selector, index)
  return page.evaluate(
    ({ selector, index }) => {
      const nodes = document.querySelectorAll(selector)
      const node = nodes[index] as any
      return node?.editor?.getHTML?.() ?? ''
    },
    { selector, index },
  )
}

/** Read the editor JSON document. */
export async function getEditorJSON(page: Page, target?: EditorSelector, index = 0): Promise<any> {
  const selector = toSelector(target)
  await waitForEditor(page, selector, index)
  return page.evaluate(
    ({ selector, index }) => {
      const nodes = document.querySelectorAll(selector)
      const node = nodes[index] as any
      return node?.editor?.getJSON?.() ?? null
    },
    { selector, index },
  )
}

/** Read editor plain text. */
export async function getEditorText(page: Page, target?: EditorSelector, index = 0): Promise<string> {
  const selector = toSelector(target)
  await waitForEditor(page, selector, index)
  return page.evaluate(
    ({ selector, index }) => {
      const nodes = document.querySelectorAll(selector)
      const node = nodes[index] as any
      return node?.editor?.getText?.() ?? ''
    },
    { selector, index },
  )
}

/** Replace the editor document with the given HTML/JSON. */
export async function setEditorContent(page: Page, content: any, target?: EditorSelector, index = 0): Promise<void> {
  const selector = toSelector(target)
  await waitForEditor(page, selector, index)
  await page.evaluate(
    ({ selector, content, index }) => {
      const nodes = document.querySelectorAll(selector)
      const node = nodes[index] as any
      node?.editor?.commands?.setContent?.(content)
    },
    { selector, content, index },
  )
}

/**
 * Evaluate an arbitrary expression string inside the browser with `editor`
 * bound to the first matching Tiptap editor. The expression can be a chain,
 * a property access, or a synchronous value-producing snippet — whatever it
 * returns becomes the awaited result.
 */
export async function editorEval<R = any>(
  page: Page,
  expression: string,
  target?: EditorSelector,
  index = 0,
): Promise<R> {
  const selector = toSelector(target)
  await waitForEditor(page, selector, index)
  return page.evaluate(
    ({ selector, index, expression }) => {
      const nodes = document.querySelectorAll(selector)
      const node = nodes[index] as any
      const editor = node?.editor
      // eslint-disable-next-line no-new-func
      return new Function('editor', `return (${expression})`)(editor)
    },
    { selector, index, expression },
  )
}

/**
 * Run a function inside the browser with a reference to the editor instance.
 * The function must be serialisable (no closures over the test scope).
 */
export async function withEditor<R, A = unknown>(
  page: Page,
  fn: (editor: any, arg: A) => R,
  arg?: A,
  target?: EditorSelector,
  index = 0,
): Promise<R> {
  const selector = toSelector(target)
  return page.evaluate(
    ({ selector, index, fnString, arg }) => {
      const nodes = document.querySelectorAll(selector)
      const node = nodes[index] as any
      const editor = node?.editor
      // eslint-disable-next-line no-new-func
      const fn = new Function(`return (${fnString})`)()
      return fn(editor, arg)
    },
    { selector, index, fnString: fn.toString(), arg: arg as any },
  )
}

/** Wait until at least one editor matching the selector is attached and ready. */
export async function waitForEditor(page: Page, target?: EditorSelector, index = 0): Promise<void> {
  const selector = toSelector(target)
  await page.waitForFunction(
    ({ selector, index }) => {
      const nodes = document.querySelectorAll(selector)
      const node = nodes[index] as any
      return !!(node && node.editor)
    },
    { selector, index },
  )
}

/** Send keyboard events to the editor's contenteditable, mimicking real typing. */
export async function typeInEditor(page: Page, text: string, target?: EditorSelector, index = 0): Promise<void> {
  const selector = toSelector(target)
  const locator = page.locator(selector).nth(index)
  await locator.click()
  await typeText(page, text)
}

/**
 * Type a string into whatever element currently has focus. Cypress' `cy.type`
 * accepts magic sequences like `{selectall}`, `{enter}`, `{backspace}`, and
 * `{shift+...}`. This helper supports the subset of sequences used by the
 * migrated tests so translations remain literal.
 */
export async function typeText(page: Page, text: string): Promise<void> {
  const tokenRegex = /(\{[^}]+\})/g
  const parts = text.split(tokenRegex).filter(part => part !== '')

  const isMac = process.platform === 'darwin'
  const modKey = isMac ? 'Meta' : 'Control'

  for (const part of parts) {
    if (part.startsWith('{') && part.endsWith('}')) {
      const token = part.slice(1, -1).trim()
      const lower = token.toLowerCase()
      switch (lower) {
        case 'selectall':
          await page.keyboard.press(`${modKey}+a`)
          break
        case 'enter':
          await page.keyboard.press('Enter')
          break
        case 'shift+enter':
          await page.keyboard.press('Shift+Enter')
          break
        case 'tab':
          await page.keyboard.press('Tab')
          break
        case 'shift+tab':
          await page.keyboard.press('Shift+Tab')
          break
        case 'backspace':
          await page.keyboard.press('Backspace')
          break
        case 'del':
        case 'delete':
          await page.keyboard.press('Delete')
          break
        case 'leftarrow':
        case 'left':
          await page.keyboard.press('ArrowLeft')
          break
        case 'rightarrow':
        case 'right':
          await page.keyboard.press('ArrowRight')
          break
        case 'uparrow':
        case 'up':
          await page.keyboard.press('ArrowUp')
          break
        case 'downarrow':
        case 'down':
          await page.keyboard.press('ArrowDown')
          break
        case 'home':
          await page.keyboard.press('Home')
          break
        case 'end':
          await page.keyboard.press('End')
          break
        case 'esc':
        case 'escape':
          await page.keyboard.press('Escape')
          break
        case 'space':
          await page.keyboard.type(' ')
          break
        default:
          if (lower.startsWith('shift+')) {
            const rest = token.slice('shift+'.length)
            await page.keyboard.press(`Shift+${rest.length === 1 ? rest.toUpperCase() : rest}`)
          } else if (lower.startsWith('cmd+') || lower.startsWith('meta+')) {
            const rest = token.split('+').slice(1).join('+')
            await page.keyboard.press(`${modKey}+${rest}`)
          } else if (lower.startsWith('ctrl+')) {
            const rest = token.slice('ctrl+'.length)
            await page.keyboard.press(`Control+${rest}`)
          } else {
            // Fallback: type the token verbatim.
            await page.keyboard.type(part)
          }
      }
    } else {
      await page.keyboard.type(part)
    }
  }
}

/**
 * Press a keyboard shortcut. Replaces the Cypress
 * `cy.trigger('keydown', { modKey: true, shiftKey?: true, key })` pattern.
 */
export async function pressShortcut(
  page: Page,
  options: { modKey?: boolean; shiftKey?: boolean; altKey?: boolean; key: string },
  target?: EditorSelector,
  index = 0,
): Promise<void> {
  // Ensure the editor has DOM focus so the keyboard event reaches it.
  // Calling `focus()` on a contenteditable keeps the existing selection
  // intact, unlike a click which would collapse it.
  const selector = toSelector(target)
  const locator = page.locator(selector).nth(index)
  try {
    await locator.focus({ timeout: 2000 })
  } catch {
    // Some pages don't have a matching editor; fall through and let the
    // keypress hit whatever is focused.
  }
  const isMac = process.platform === 'darwin'
  const modKey = isMac ? 'Meta' : 'Control'
  const parts: string[] = []
  if (options.modKey) {
    parts.push(modKey)
  }
  if (options.shiftKey) {
    parts.push('Shift')
  }
  if (options.altKey) {
    parts.push('Alt')
  }
  parts.push(options.key.length === 1 ? options.key.toUpperCase() : options.key)
  await page.keyboard.press(parts.join('+'))
}

/**
 * Replacement for the custom `cy.paste()` command. Dispatches a real
 * `paste` event on the editor's outer element with the provided payload.
 */
export async function pasteIntoEditor(
  page: Page,
  options: {
    pastePayload?: any
    paste?: any
    pasteType?: 'text/plain' | 'text/html' | 'application/json' | string
  },
  target?: EditorSelector,
  index = 0,
): Promise<void> {
  const selector = toSelector(target)
  const pastePayload = options.paste ?? options.pastePayload
  let pasteType = options.pasteType
  if (!pasteType) {
    pasteType = typeof pastePayload === 'string' ? 'text/plain' : 'application/json'
  }
  const data = pasteType === 'application/json' ? JSON.stringify(pastePayload) : (pastePayload as string)

  await page.evaluate(
    ({ selector, index, data, pasteType }) => {
      const nodes = document.querySelectorAll(selector)
      const el = nodes[index] as HTMLElement | undefined
      if (!el) {
        return
      }
      const clipboardData = new DataTransfer()
      clipboardData.setData(pasteType, data)
      const event = new ClipboardEvent('paste', {
        bubbles: true,
        cancelable: true,
        clipboardData,
      })
      el.dispatchEvent(event)
    },
    { selector, index, data, pasteType },
  )
}
