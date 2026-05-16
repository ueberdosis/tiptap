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

test.describe('/src/Nodes/HorizontalRule/React/', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/src/Nodes/HorizontalRule/React/')
  })

  test.beforeEach(async ({ page }) => {
    await setEditorContent(page, '<p>Example Text</p>')
  })

  test('should parse horizontal rules correctly', async ({ page }) => {
    await setEditorContent(page, '<p>Example Text</p><hr>')
    expect(await getEditorHTML(page)).toBe('<p>Example Text</p><hr>')
  })

  test('should parse horizontal rules with self-closing tag correctly', async ({ page }) => {
    await setEditorContent(page, '<p>Example Text</p><hr />')
    expect(await getEditorHTML(page)).toBe('<p>Example Text</p><hr>')
  })

  test('the button should add a horizontal rule', async ({ page }) => {
    await expect(page.locator('.tiptap hr')).toHaveCount(0)

    await page.locator('button').first().click()

    await expect(page.locator('.tiptap hr')).toHaveCount(1)
  })

  test('the default markdown shortcut should add a horizontal rule', async ({ page }) => {
    await waitForEditor(page, '.tiptap')
    await page.evaluate(__expr => {
      const editor = (document.querySelector('.tiptap') as any).editor
      editor.commands.clearContent()
    }, undefined)

    await expect(page.locator('.tiptap hr')).toHaveCount(0)

    await page.locator('.tiptap').first().click()
    await typeText(page, '---')

    await expect(page.locator('.tiptap hr')).toHaveCount(1)
  })

  test('the alternative markdown shortcut should add a horizontal rule', async ({ page }) => {
    await waitForEditor(page, '.tiptap')
    await page.evaluate(__expr => {
      const editor = (document.querySelector('.tiptap') as any).editor
      editor.commands.clearContent()
    }, undefined)

    await expect(page.locator('.tiptap hr')).toHaveCount(0)

    await page.locator('.tiptap').first().click()
    await typeText(page, '___ ')

    await expect(page.locator('.tiptap hr')).toHaveCount(1)
  })

  test('should replace selection correctly', async ({ page }) => {
    await setEditorContent(page, '<p>Example Text</p><p>Example Text</p>')

    // From the start of the document to the start of the second textblock.
    await waitForEditor(page, '.tiptap')
    await page.evaluate(__expr => {
      const editor = (document.querySelector('.tiptap') as any).editor
      editor.commands.setTextSelection({ from: 0, to: 15 })
    }, undefined)
    await waitForEditor(page, '.tiptap')
    await page.evaluate(__expr => {
      const editor = (document.querySelector('.tiptap') as any).editor
      editor.commands.setHorizontalRule()
    }, undefined)

    expect(await getEditorHTML(page)).toBe('<hr><p>Example Text</p>')

    await setEditorContent(page, '<p>Example Text</p><p>Example Text</p>')

    // From the end of the first textblock to the start of the second textblock.
    await waitForEditor(page, '.tiptap')
    await page.evaluate(__expr => {
      const editor = (document.querySelector('.tiptap') as any).editor
      editor.commands.setTextSelection({ from: 13, to: 15 })
    }, undefined)
    await waitForEditor(page, '.tiptap')
    await page.evaluate(__expr => {
      const editor = (document.querySelector('.tiptap') as any).editor
      editor.commands.setHorizontalRule()
    }, undefined)

    expect(await getEditorHTML(page)).toBe('<p>Example Text</p><hr><p>Example Text</p>')
  })
})
