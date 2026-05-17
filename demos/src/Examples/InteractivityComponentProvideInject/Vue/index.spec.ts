import { editorEval, expect, test, waitForEditor } from '../../../../../tests/e2e/support/index.js'

test.describe('/src/Examples/InteractivityComponentProvideInject/Vue/', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/src/Examples/InteractivityComponentProvideInject/Vue/')
  })

  test('should have a working tiptap instance', async ({ page }) => {
    await waitForEditor(page, '.tiptap')
    const hasEditor = await editorEval<boolean>(page, 'editor != null')
    expect(hasEditor).toBe(true)
  })

  test('should render a custom node', async ({ page }) => {
    await expect(page.locator('.tiptap .vue-component')).toHaveCount(1)
  })

  test('should have global and all injected values', async ({ page }) => {
    const expectedTexts = ['globalValue', 'appValue', 'indexValue', 'editorValue']
    const paragraphs = page.locator('.tiptap .vue-component p')
    await expect(paragraphs).toHaveCount(expectedTexts.length)
    for (let i = 0; i < expectedTexts.length; i++) {
      await expect(paragraphs.nth(i)).toHaveText(expectedTexts[i])
    }
  })
})
