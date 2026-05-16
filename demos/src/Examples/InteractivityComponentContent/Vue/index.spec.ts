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

test.describe('/src/Examples/InteractivityComponentContent/Vue/', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/src/Examples/InteractivityComponentContent/Vue/')
  })

  test('should have a working tiptap instance', async ({ page }) => {
    // eslint-disable-next-line
    expect(editor).to.not.be.null
  })

  test('should render a custom node', async ({ page }) => {
    await expect(page.locator('.tiptap .vue-component')).toHaveCount(1)
  })

  test('should allow text editing inside component', async ({ page }) => {
    /* invoke('attr') value */ await page
      .locator('.tiptap .vue-component .content')
      .first()
      .getAttribute('contentEditable')(
      /* invoke('text') value */ await page.locator('.tiptap .vue-component .content').first().innerText(),
    )
    await page.locator('.tiptap .vue-component .content').first().click()
    await typeText(page, 'Hello World!')
    await expect(page.locator('.tiptap .vue-component .content').first()).toHaveText('Hello World!')
  })

  test('should allow text editing inside component with markdown text', async ({ page }) => {
    /* invoke('attr') value */ await page
      .locator('.tiptap .vue-component .content')
      .first()
      .getAttribute('contentEditable')(
      /* invoke('text') value */ await page.locator('.tiptap .vue-component .content').first().innerText(),
    )
    await page.locator('.tiptap .vue-component .content').first().click()
    await typeText(page, 'Hello World! This is **bold**.')
    await expect(page.locator('.tiptap .vue-component .content').first()).toHaveText('Hello World! This is bold.')

    await expect(page.locator('.tiptap .vue-component .content strong').first()).toBeAttached()
  })

  test('should remove node via selectall', async ({ page }) => {
    await expect(page.locator('.tiptap .vue-component')).toHaveCount(1)

    await page.locator('.tiptap').first().click()
    await typeText(page, '{selectall}{backspace}')

    await expect(page.locator('.tiptap .vue-component')).toHaveCount(0)
  })
})
