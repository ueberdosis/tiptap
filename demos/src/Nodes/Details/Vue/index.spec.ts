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

test.describe('/src/Nodes/Details/Vue/', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/src/Nodes/Details/Vue/')

    await setEditorContent(page, '<p>Example Text</p>')
    await page.locator('.ProseMirror').first().click()
    await typeText(page, '{selectall}')
  })

  test('should parse details tags correctly', async ({ page }) => {
    await setEditorContent(page, '<details><summary>Summary</summary><p>Content</p></details>')
    expect(await getEditorHTML(page)).toBe(
      '<details class="details"><summary>Summary</summary><div data-type="detailsContent"><p>Content</p></div></details><p></p>',
    )
  })

  test('should parse details tags without paragraphs correctly', async ({ page }) => {
    await setEditorContent(page, '<details><summary>Summary</summary>Content</details>')
    expect(await getEditorHTML(page)).toBe(
      '<details class="details"><summary>Summary</summary><div data-type="detailsContent"><p>Content</p></div></details><p></p>',
    )
  })

  test('setDetails should make the selected line a details node', async ({ page }) => {
    await expect(page.locator('.ProseMirror [data-type="details"]')).toHaveCount(0)

    await page.locator('button').first().click()

    await expect(
      page.locator('.ProseMirror').locator('[data-type="details"] [data-type="detailsContent"]'),
    ).toContainText('Example Text')
  })

  test('unsetDetails should make the selected line a paragraph node', async ({ page }) => {
    await page.locator('button').first().click()

    await expect(page.locator('.ProseMirror [data-type="details"]')).toHaveCount(1)

    await page.locator('button:nth-child(2)').first().click()

    await expect(page.locator('.ProseMirror [data-type="details"]')).toHaveCount(0)
  })
})
