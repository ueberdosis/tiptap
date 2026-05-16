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

test.describe('/src/Demos/CollaborationSplitPane/React/', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/src/Demos/CollaborationSplitPane/React/')
  })

  test('should have a working tiptap instance', async ({ page }) => {
    // eslint-disable-next-line
    expect(editor).to.not.be.null
  })

  test('should have a ydoc', async ({ page }) => {
    /**
     * @type {import('yjs').Doc}
     */
    const yDoc = await editorEval(
      page,
      "editor.extensionManager.extensions.find(a => a.name === 'collaboration').options.document",
      '.tiptap',
    )

    // eslint-disable-next-line
    expect(yDoc).to.not.be.null
  })
})
