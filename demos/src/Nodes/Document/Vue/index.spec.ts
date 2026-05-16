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

test.describe('/src/Nodes/Document/Vue/', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/src/Nodes/Document/Vue/')
  })

  test.beforeEach(async ({ page }) => {
    await setEditorContent(page, '<p></p>')
  })

  test('should return the document in as json', async ({ page }) => {
    const json = await editorEval(page, 'editor.getJSON()', '.tiptap')

    expect(json).toEqual({ type: 'doc', content: [{ type: 'paragraph' }] })
  })
})
