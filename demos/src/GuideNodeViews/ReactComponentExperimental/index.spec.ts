import { expect, test } from '@playwright/test'

import { getEditor } from '../../../test/helpers.js'

const demoName = 'ReactComponentExperimental'
const demoPath = '/src/GuideNodeViews'
const fullDemoPath = `${demoPath}/${demoName}/React/`

test.describe(`${demoPath}/${demoName}`, () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(fullDemoPath)
    await getEditor(page)
  })

  test('renders the node view without wrapper DOM', async ({ page }) => {
    // The component's own element is a direct child of the editor: no
    // wrapper element, no portal container in between
    await expect(page.locator('.tiptap > .react-component')).toHaveCount(1)
    await expect(page.locator('.tiptap [data-node-view-wrapper]')).toHaveCount(0)
  })

  test('updates attributes through the component button', async ({ page }) => {
    const button = page.locator('.tiptap .react-component button')

    await expect(button).toContainText('clicked 0 times')
    await button.click()
    await expect(button).toContainText('clicked 1 times')
    // The node view element survives the attribute update (no remount)
    await button.click()
    await expect(button).toContainText('clicked 2 times')
  })

  test('types text into a paragraph', async ({ page }) => {
    const firstParagraph = page.locator('.tiptap p').first()

    await firstParagraph.click()
    await page.keyboard.press('ControlOrMeta+a')
    await page.keyboard.press('Delete')
    await page.keyboard.type('Hello React renderer')

    await expect(page.locator('.tiptap p').first()).toHaveText('Hello React renderer')
  })

  test('splits a paragraph with Enter and keeps typing', async ({ page }) => {
    const editor = await getEditor(page)

    await editor.evaluate((el: any) => {
      el.editor.commands.setContent('<p>onetwo</p>')
    })
    // Focus through a real click; the selection command then syncs to the DOM
    await page.locator('.tiptap p').first().click()
    await editor.evaluate((el: any) => {
      el.editor.commands.setTextSelection(4)
    })

    await page.keyboard.press('Enter')
    await page.keyboard.type('x')

    await expect(page.locator('.tiptap p').nth(0)).toHaveText('one')
    await expect(page.locator('.tiptap p').nth(1)).toHaveText('xtwo')
  })

  test('round-trips a selection set from the state', async ({ page }) => {
    const editor = await getEditor(page)

    await editor.evaluate((el: any) => {
      el.editor.commands.setContent('<p>foo</p><p>bar</p>')
    })
    await page.locator('.tiptap p').first().click()
    await editor.evaluate((el: any) => {
      el.editor.commands.setTextSelection({ from: 2, to: 8 })
    })

    const selectionText = await page.evaluate(() => window.getSelection()?.toString())

    // Chrome serializes the paragraph boundary as one or two newlines
    expect(selectionText?.replace(/\n+/g, '\n')).toBe('oo\nba')

    // And back: the DOM selection maps to the same state selection
    const stateSelection = await editor.evaluate((el: any) => ({
      from: el.editor.state.selection.from,
      to: el.editor.state.selection.to,
    }))

    expect(stateSelection).toEqual({ from: 2, to: 8 })
  })

  test('types at a cursor placed through the DOM selection', async ({ page }) => {
    const editor = await getEditor(page)

    await editor.evaluate((el: any) => {
      el.editor.chain().setMeta('addToHistory', false).setContent('<p>abcdef</p>').run()
    })
    await page.locator('.tiptap p').first().click()
    // Move the cursor the way arrow keys or a precise click would
    await page.evaluate(() => {
      const text = document.querySelector('.tiptap p')?.firstChild as Text

      window.getSelection()?.collapse(text, 3)
    })

    await page.keyboard.type('X')

    await expect(page.locator('.tiptap p').first()).toHaveText('abcXdef')
  })

  test('deletes a range selected through the DOM with Backspace', async ({ page }) => {
    const editor = await getEditor(page)

    await editor.evaluate((el: any) => {
      el.editor.chain().setMeta('addToHistory', false).setContent('<p>abcdef</p>').run()
    })
    await page.locator('.tiptap p').first().click()
    await page.evaluate(() => {
      const text = document.querySelector('.tiptap p')?.firstChild as Text

      window.getSelection()?.setBaseAndExtent(text, 1, text, 5)
    })

    await page.keyboard.press('Backspace')

    await expect(page.locator('.tiptap p').first()).toHaveText('af')
  })

  test('splits at a cursor placed through the DOM selection on Enter', async ({ page }) => {
    const editor = await getEditor(page)

    await editor.evaluate((el: any) => {
      el.editor.chain().setMeta('addToHistory', false).setContent('<p>onetwo</p>').run()
    })
    await page.locator('.tiptap p').first().click()
    await page.evaluate(() => {
      const text = document.querySelector('.tiptap p')?.firstChild as Text

      window.getSelection()?.collapse(text, 3)
    })

    await page.keyboard.press('Enter')

    await expect(page.locator('.tiptap p').nth(0)).toHaveText('one')
    await expect(page.locator('.tiptap p').nth(1)).toHaveText('two')
  })

  test('applies mark input rules while typing', async ({ page }) => {
    const editor = await getEditor(page)

    await editor.evaluate((el: any) => {
      el.editor.chain().setMeta('addToHistory', false).setContent('<p></p>').run()
    })
    await page.locator('.tiptap p').first().click()
    await page.keyboard.type('some **bold** text')

    await expect(page.locator('.tiptap p strong')).toHaveText('bold')
  })

  test('applies node input rules while typing', async ({ page }) => {
    const editor = await getEditor(page)

    await editor.evaluate((el: any) => {
      el.editor.chain().setMeta('addToHistory', false).setContent('<p></p>').run()
    })
    await page.locator('.tiptap p').first().click()
    await page.keyboard.type('## Heading rule')

    await expect(page.locator('.tiptap h2')).toHaveText('Heading rule')
  })

  test('toggles bold on a selected range with the keymap', async ({ page }) => {
    const editor = await getEditor(page)

    await editor.evaluate((el: any) => {
      el.editor.chain().setMeta('addToHistory', false).setContent('<p>make me bold</p>').run()
    })
    await page.locator('.tiptap p').first().click()
    await page.evaluate(() => {
      const text = document.querySelector('.tiptap p')?.firstChild as Text

      window.getSelection()?.setBaseAndExtent(text, 5, text, 7)
    })

    await page.keyboard.press('ControlOrMeta+b')

    await expect(page.locator('.tiptap p strong')).toHaveText('me')
  })

  test('handles pasted HTML through the clipboard pipeline', async ({ page }) => {
    const editor = await getEditor(page)

    await editor.evaluate((el: any) => {
      el.editor.chain().setMeta('addToHistory', false).setContent('<p>start:</p>').run()
    })
    await page.locator('.tiptap p').first().click()
    await page.keyboard.press('End')

    await editor.evaluate((el: any) => {
      const data = new DataTransfer()

      data.setData('text/html', '<strong>pasted</strong>')
      el.editor.view.dom.dispatchEvent(
        new ClipboardEvent('paste', { clipboardData: data, bubbles: true, cancelable: true }),
      )
    })

    await expect(page.locator('.tiptap p strong')).toHaveText('pasted')
    await expect(page.locator('.tiptap p').first()).toHaveText('start:pasted')
  })

  test('preserves consecutive and trailing spaces', async ({ page }) => {
    const editor = await getEditor(page)

    // The whitespace CSS only applies through the ProseMirror class
    await expect(editor).toHaveClass(/ProseMirror/)
    const whiteSpace = await editor.evaluate(element => getComputedStyle(element).whiteSpace)

    expect(['pre-wrap', 'break-spaces']).toContain(whiteSpace)

    await editor.evaluate((el: any) => {
      el.editor.chain().setMeta('addToHistory', false).setContent('<p>ab</p>').run()
    })
    await page.locator('.tiptap p').first().click()
    await page.keyboard.press('End')
    await page.keyboard.type('  x')

    const text = await editor.evaluate((el: any) => el.editor.state.doc.textContent)

    expect(text).toBe('ab  x')

    // Both spaces render (no collapsing), so the DOM text matches the doc
    const domText = await page
      .locator('.tiptap p')
      .first()
      .evaluate(node => node.textContent)

    expect(domText).toBe('ab  x')
  })

  test('undoes and redoes typed text', async ({ page }) => {
    const editor = await getEditor(page)

    // Keep the content swap out of history, so undo only reverts the typing
    await editor.evaluate((el: any) => {
      el.editor.chain().setMeta('addToHistory', false).setContent('<p>base</p>').run()
    })
    await page.locator('.tiptap p').first().click()
    await page.keyboard.press('End')

    await page.keyboard.type(' plus')
    await expect(page.locator('.tiptap p').first()).toHaveText('base plus')

    await page.keyboard.press('ControlOrMeta+z')
    await expect(page.locator('.tiptap p').first()).toHaveText('base')

    await page.keyboard.press('ControlOrMeta+Shift+z')
    await expect(page.locator('.tiptap p').first()).toHaveText('base plus')
  })
})
