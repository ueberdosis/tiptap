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

test.describe('/src/Nodes/Document/React/', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/src/Nodes/Document/React/')
  })

  test.beforeEach(async ({ page }) => {
    await setEditorContent(page, '<p></p>')
  })

  test('should return the document in as json', async ({ page }) => {
    const json = await editorEval(page, '(await getEditorJSON(page))', '.tiptap')

    expect(json).toEqual({ type: 'doc', content: [{ type: 'paragraph' }] })
  })
})
