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

test.describe('/src/Extensions/FloatingMenu/React/', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/src/Extensions/FloatingMenu/React/')
  })

  test('should not render a floating menu on non-empty nodes', async ({ page }) => {
    await waitForEditor(page, '.tiptap')
    await page.evaluate(__expr => {
      const editor = (document.querySelector('.tiptap') as any).editor
      editor.chain().setContent('<p>Example Text</p>').focus().run()
    }, undefined)
    const floatingMenu = cy.get('[data-testID="floating-menu"]')

    floatingMenu.should('not.exist')
  })

  test('should render a floating menu on empty nodes', async ({ page }) => {
    await waitForEditor(page, '.tiptap')
    await page.evaluate(__expr => {
      const editor = (document.querySelector('.tiptap') as any).editor
      editor.chain().setContent('<p></p>').focus().run()
    }, undefined)
    const floatingMenu = cy.get('[data-testID="floating-menu"]')

    floatingMenu.should('exist')
  })
})
