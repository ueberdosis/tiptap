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

test.describe('/src/Extensions/TextAlign/Vue/', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/src/Extensions/TextAlign/Vue/')
  })

  test.beforeEach(async ({ page }) => {
    await setEditorContent(page, '<p>Example Text</p>')
  })

  test('should parse a null alignment correctly', async ({ page }) => {
    await setEditorContent(page, '<p>Example Text</p>')
    expect(await getEditorHTML(page)).toBe('<p>Example Text</p>')
  })

  test('should parse left align text correctly (and not render)', async ({ page }) => {
    await setEditorContent(page, '<p style="text-align: left">Example Text</p>')
    expect(await getEditorHTML(page)).toBe('<p style="text-align: left">Example Text</p>')
  })

  test('should parse center align text correctly', async ({ page }) => {
    await setEditorContent(page, '<p style="text-align: center">Example Text</p>')
    expect(await getEditorHTML(page)).toBe('<p style="text-align: center">Example Text</p>')
  })

  test('should parse right align text correctly', async ({ page }) => {
    await setEditorContent(page, '<p style="text-align: right">Example Text</p>')
    expect(await getEditorHTML(page)).toBe('<p style="text-align: right">Example Text</p>')
  })

  test('should parse left justify text correctly', async ({ page }) => {
    await setEditorContent(page, '<p style="text-align: justify">Example Text</p>')
    expect(await getEditorHTML(page)).toBe('<p style="text-align: justify">Example Text</p>')
  })

  test('should keep the text aligned when toggling headings', async ({ page }) => {
    const alignments = ['center', 'right', 'justify']
    const headings = [1, 2]

    for (const alignment of alignments) {
      for (const level of headings) {
        await setEditorContent(page, `<p style="text-align: ${alignment}">Example Text</p>`)
        await editorEval(page, `editor.commands.toggleHeading({ level: ${level} })`)
        expect(await getEditorHTML(page)).toBe(`<h${level} style="text-align: ${alignment}">Example Text</h${level}>`)
      }
    }
  })

  test('aligns the text left on the 1st button', async ({ page }) => {
    await page.locator('button:nth-child(1)').first().click()

    await expect(page.locator('.tiptap').locator('p').first()).toHaveCSS('text-align', 'left')
  })

  test('aligns the text center on the 2nd button', async ({ page }) => {
    await page.locator('button:nth-child(2)').first().click()

    await expect(page.locator('.tiptap').locator('p').first()).toHaveCSS('text-align', 'center')
  })

  test('aligns the text right on the 3rd button', async ({ page }) => {
    await page.locator('button:nth-child(3)').first().click()

    await expect(page.locator('.tiptap').locator('p').first()).toHaveCSS('text-align', 'right')
  })

  test('aligns the text justified on the 4th button', async ({ page }) => {
    await page.locator('button:nth-child(4)').first().click()

    await expect(page.locator('.tiptap').locator('p').first()).toHaveCSS('text-align', 'justify')
  })

  test('aligns the text default on the 5th button', async ({ page }) => {
    await page.locator('button:nth-child(5)').first().click()

    // TODO(playwright-migration): unhandled should('not.have.css', ...) on page.locator('.tiptap').locator('p')
  })

  test('toggle the text to right on the 6th button', async ({ page }) => {
    await page.locator('button:nth-child(6)').first().click()

    await expect(page.locator('.tiptap').locator('p').first()).toHaveCSS('text-align', 'right')

    await page.locator('button:nth-child(6)').first().click()

    await expect(page.locator('.tiptap').locator('p').first()).toHaveCSS('text-align', 'start')
  })

  test('toggle the text to right on the 6th button (2)', async ({ page }) => {
    await page.locator('button:nth-child(6)').first().click()

    await expect(page.locator('.tiptap').locator('p').first()).toHaveCSS('text-align', 'right')

    await page.locator('button:nth-child(6)').first().click()

    // TODO(playwright-migration): unhandled should('not.have.css', ...) on page.locator('.tiptap').locator('p')
  })

  test('aligns the text left when pressing the keyboard shortcut', async ({ page }) => {
    await pressShortcut(page, { modKey: true, shiftKey: true, key: 'l' })
    await expect(page.locator('.tiptap').locator('p').first()).toHaveCSS('text-align', 'left')
  })

  test('aligns the text center when pressing the keyboard shortcut', async ({ page }) => {
    await pressShortcut(page, { modKey: true, shiftKey: true, key: 'e' })
    await expect(page.locator('.tiptap').locator('p').first()).toHaveCSS('text-align', 'center')
  })

  test('aligns the text right when pressing the keyboard shortcut', async ({ page }) => {
    await pressShortcut(page, { modKey: true, shiftKey: true, key: 'r' })
    await expect(page.locator('.tiptap').locator('p').first()).toHaveCSS('text-align', 'right')
  })

  test('aligns the text justified when pressing the keyboard shortcut', async ({ page }) => {
    await pressShortcut(page, { modKey: true, shiftKey: true, key: 'j' })
    await expect(page.locator('.tiptap').locator('p').first()).toHaveCSS('text-align', 'justify')
  })
})
