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

test.describe('/src/Extensions/CollaborationWithMenus/Vue/', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/src/Extensions/CollaborationWithMenus/Vue/')
  })

  test('should have a working tiptap instance', async ({ page }) => {
    await waitForEditor(page, '.tiptap')
    const hasEditor = await editorEval<boolean>(page, 'editor != null')
    expect(hasEditor).toBe(true)
  })

  test('should have menu plugins initiated', async ({ page }) => {
    await waitForEditor(page, '.tiptap')
    const hasBothMenuPluginsLoaded = await editorEval<boolean>(
      page,
      '(() => {' +
        " const bubbleMenuPlugin = editor.view.state.plugins.find(p => p.spec.key?.key === 'bubbleMenu$');" +
        " const floatingMenuPlugin = editor.view.state.plugins.find(p => p.spec.key?.key === 'floatingMenu$');" +
        ' return !!bubbleMenuPlugin && !!floatingMenuPlugin;' +
        ' })()',
    )
    expect(hasBothMenuPluginsLoaded).toBe(true)
  })

  test('should have a ydoc', async ({ page }) => {
    const yDocHasValue = await editorEval<boolean>(
      page,
      "editor.extensionManager.extensions.find(a => a.name === 'collaboration').options.document != null",
    )
    expect(yDocHasValue).toBe(true)
  })
})
