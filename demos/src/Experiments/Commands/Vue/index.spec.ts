import {
  editorEval,
  expect,
  getEditorHTML,
  getEditorJSON,
  getEditorText,
  pasteIntoEditor,
  pressShortcut,
  setEditorContent,
  test,
  typeInEditor,
  typeText,
  waitForEditor,
  withEditor,
} from '../../../../../tests/e2e/support/index.js'

test.describe('/src/Experiments/Commands/Vue/', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/src/Experiments/Commands/Vue/')
  })

  test.beforeEach(async ({ page }) => {
    await waitForEditor(page, '.tiptap')
    await page.evaluate(__expr => {
      const editor = (document.querySelector('.tiptap') as any).editor
      editor.commands.clearContent()
    }, undefined)
  })

  test('should open a popup after typing a slash', async ({ page }) => {
    const items = [{ tag: 'h1' }, { tag: 'h2' }, { tag: 'strong' }, { tag: 'em' }]

    let i = 0
    for (const item of items) {
      await page.locator('.tiptap').first().click()
      await typeText(page, '{selectall}{backspace}/')
      await expect(page.locator('.dropdown-menu')).toHaveCount(1)
      await page.locator('.dropdown-menu button').nth(i).click()
      await page.locator('.tiptap').first().click()
      await typeText(page, `I am a ${item.tag}`)
      await expect(page.locator(`.tiptap ${item.tag}`)).toHaveCount(1)
      await expect(page.locator(`.tiptap ${item.tag}`)).toHaveText(`I am a ${item.tag}`)
      i++
    }
  })

  test('should close the popup without any command via esc', async ({ page }) => {
    await page.locator('.tiptap').first().click()
    await typeText(page, '{selectall}{backspace}/')
    await expect(page.locator('.dropdown-menu')).toHaveCount(1)
    await page.locator('.tiptap').first().click()
    await typeText(page, '{esc}')
    await expect(page.locator('.dropdown-menu')).toHaveCount(0)
  })

  test('should open the popup when the cursor is after a slash', async ({ page }) => {
    await page.locator('.tiptap').first().click()
    await typeText(page, '{selectall}{backspace}/')
    await expect(page.locator('.dropdown-menu')).toHaveCount(1)
    await page.locator('.tiptap').first().click()
    await typeText(page, '{leftArrow}')
    await expect(page.locator('.dropdown-menu')).toHaveCount(0)
    await page.locator('.tiptap').first().click()
    await typeText(page, '{rightArrow}')
    await expect(page.locator('.dropdown-menu')).toHaveCount(1)
  })
})
