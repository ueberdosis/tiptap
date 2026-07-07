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
