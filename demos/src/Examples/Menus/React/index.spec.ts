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

test.describe('/src/Examples/Menus/React/', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/src/Examples/Menus/React/')
  })

  test.beforeEach(async ({ page }) => {
    await waitForEditor(page, '.tiptap')
    await page.evaluate(__expr => {
      const editor = (document.querySelector('.tiptap') as any).editor
      editor.chain().focus().clearContent().run()
    }, undefined)
  })

  test('should show menu when the editor is empty', async ({ page }) => {
    page.locator('body').locator('.floating-menu')
  })

  test('should show menu when text is selected', async ({ page }) => {
    await page.locator('.tiptap').first().click()
    await typeText(page, 'Test')
    await page.locator('.tiptap').first().click()
    await typeText(page, '{selectall}')

    page.locator('body').locator('.bubble-menu')
  })

  const marks = [
    {
      button: 'Bold',
      tag: 'strong',
    },
    {
      button: 'Italic',
      tag: 'em',
    },
    {
      button: 'Strike',
      tag: 's',
    },
  ]

  for (const mark of marks) {
    test(`should apply ${mark.button} correctly`, async ({ page }) => {
      await page.locator('.tiptap').first().click()
      await typeText(page, 'Test')
      await page.locator('.tiptap').first().click()
      await typeText(page, '{selectall}')

      await page.locator('body').locator('.bubble-menu').filter({ hasText: mark.button }).first().click()

      page.locator('.tiptap').locator(`p ${mark.tag}`)
    })
  }
})
