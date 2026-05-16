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

test.describe('/src/Nodes/Paragraph/React/', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/src/Nodes/Paragraph/React/')
  })

  test.beforeEach(async ({ page }) => {
    await waitForEditor(page, '.tiptap')
    await page.evaluate(__expr => {
      const editor = (document.querySelector('.tiptap') as any).editor
      editor.commands.clearContent()
    }, undefined)
  })

  test('should parse paragraphs correctly', async ({ page }) => {
    await setEditorContent(page, '<p>Example Text</p>')
    expect(await getEditorHTML(page)).toBe('<p>Example Text</p>')

    await setEditorContent(page, '<p><x-unknown>Example Text</x-unknown></p>')
    expect(await getEditorHTML(page)).toBe('<p>Example Text</p>')

    await setEditorContent(page, '<p style="display: block;">Example Text</p>')
    expect(await getEditorHTML(page)).toBe('<p>Example Text</p>')
  })

  test('text should be wrapped in a paragraph by default', async ({ page }) => {
    await page.locator('.tiptap').first().click()
    await typeText(page, 'Example Text')
    await expect(page.locator('.tiptap').locator('p')).toContainText('Example Text')
  })

  test('enter should make a new paragraph', async ({ page }) => {
    await page.locator('.tiptap').first().click()
    await typeText(page, 'First Paragraph{enter}Second Paragraph')
    await expect(page.locator('.tiptap').locator('p')).toHaveCount(2)

    await expect(page.locator('.tiptap').locator('p:first')).toContainText('First Paragraph')

    await expect(page.locator('.tiptap').locator('p:nth-child(2)')).toContainText('Second Paragraph')
  })

  test('backspace should remove the second paragraph', async ({ page }) => {
    await page.locator('.tiptap').first().click()
    await typeText(page, '{enter}')
    await expect(page.locator('.tiptap').locator('p')).toHaveCount(2)

    await page.locator('.tiptap').first().click()
    await typeText(page, '{backspace}')
    await expect(page.locator('.tiptap').locator('p')).toHaveCount(1)
  })
})
