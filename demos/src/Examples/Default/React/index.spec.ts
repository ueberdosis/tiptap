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

test.describe('/src/Examples/Default/React/', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/src/Examples/Default/React/')

    await setEditorContent(page, '<h1>Example Text</h1>')
    await page.locator('.tiptap').first().click()
    await typeText(page, '{selectall}')
  })

  test('should apply the paragraph style when the keyboard shortcut is pressed', async ({ page }) => {
    await expect(page.locator('.tiptap h1').first()).toBeAttached()

    await pressShortcut(page, { modKey: true, altKey: true, key: '0' })
    await expect(page.locator('.tiptap').locator('p').filter({ hasText: 'Example Text' }).first()).toBeAttached()
  })

  const buttonMarks = [
    { label: 'Bold', tag: 'strong' },
    { label: 'Italic', tag: 'em' },
    { label: 'Strike', tag: 's' },
  ]

  test(`should disable bold, italic, strike when the code tag is enabled for cursor`, async ({ page }) => {
    for (const m of buttonMarks) {
      await page.locator('.tiptap').first().click()
      await typeText(page, '{selectall}Hello world')
      await page.locator('button').filter({ hasText: 'Code' }).first().click()
      await expect(page.locator('button').filter({ hasText: m.label }).first()).toBeDisabled()
    }
  })

  test(`should enable bold, italic, strike when the code tag is disabled for cursor`, async ({ page }) => {
    for (const m of buttonMarks) {
      await page.locator('.tiptap').first().click()
      await typeText(page, '{selectall}Hello world')
      await page.locator('button').filter({ hasText: 'Code' }).first().click()
      await page.locator('button').filter({ hasText: 'Code' }).first().click()
      await expect(page.locator('button').filter({ hasText: m.label }).first()).toBeEnabled()
    }
  })

  test(`should disable bold, italic, strike when the code tag is enabled for selection`, async ({ page }) => {
    for (const m of buttonMarks) {
      await page.locator('.tiptap').first().click()
      await typeText(page, '{selectall}{backspace}')
      await page.locator('.tiptap').first().click()
      await typeText(page, '{selectall}Hello world{selectall}')
      await page.locator('button').filter({ hasText: 'Code' }).first().click()
      await expect(page.locator('button').filter({ hasText: m.label }).first()).toBeDisabled()
    }
  })

  test(`should enable bold, italic, strike when the code tag is disabled for selection`, async ({ page }) => {
    for (const m of buttonMarks) {
      await page.locator('.tiptap').first().click()
      await typeText(page, '{selectall}Hello world{selectall}')
      await page.locator('button').filter({ hasText: 'Code' }).first().click()
      await page.locator('button').filter({ hasText: 'Code' }).first().click()
      await expect(page.locator('button').filter({ hasText: m.label }).first()).toBeEnabled()
    }
  })

  test(`should apply bold, italic, strike when the button is pressed`, async ({ page }) => {
    for (const m of buttonMarks) {
      await page.locator('.tiptap').first().click()
      await typeText(page, '{selectall}{backspace}')
      await page.locator('.tiptap').first().click()
      await typeText(page, '{selectall}Hello world{selectall}')
      await page.locator('button').filter({ hasText: 'Paragraph' }).first().click()
      await page.locator('button').filter({ hasText: m.label }).first().click()
      await expect(page.locator(`.tiptap ${m.tag}`).first()).toBeAttached()
      await expect(page.locator(`.tiptap ${m.tag}`).first()).toHaveText('Hello world')
    }
  })

  test('should clear marks when the button is pressed', async ({ page }) => {
    await page.locator('.tiptap').first().click()
    await typeText(page, '{selectall}Hello world')
    await page.locator('button').filter({ hasText: 'Paragraph' }).first().click()
    await page.locator('.tiptap').first().click()
    await typeText(page, '{selectall}')
    await page.locator('button').filter({ hasText: 'Bold' }).first().click()
    await expect(page.locator('.tiptap strong').first()).toBeAttached()
    await expect(page.locator('.tiptap strong').first()).toHaveText('Hello world')
    await page.locator('button').filter({ hasText: 'Clear marks' }).first().click()
    await expect(page.locator('.tiptap strong')).toHaveCount(0)
  })

  test('should clear nodes when the button is pressed', async ({ page }) => {
    await page.locator('.tiptap').first().click()
    await typeText(page, '{selectall}Hello world')
    await page.locator('button').filter({ hasText: 'Bullet list' }).first().click()
    await expect(page.locator('.tiptap ul').first()).toBeAttached()
    await expect(page.locator('.tiptap ul').first()).toHaveText('Hello world')
    await page.locator('.tiptap').first().click()
    await typeText(page, '{enter}A second item{enter}A third item{selectall}')
    await page.locator('button').filter({ hasText: 'Clear nodes' }).first().click()
    await expect(page.locator('.tiptap ul')).toHaveCount(0)
    await expect(page.locator('.tiptap p')).toHaveCount(4)
  })

  const buttonNodes = [
    { label: 'H1', tag: 'h1' },
    { label: 'H2', tag: 'h2' },
    { label: 'H3', tag: 'h3' },
    { label: 'H4', tag: 'h4' },
    { label: 'H5', tag: 'h5' },
    { label: 'H6', tag: 'h6' },
    { label: 'Bullet list', tag: 'ul' },
    { label: 'Ordered list', tag: 'ol' },
    { label: 'Code block', tag: 'pre code' },
    { label: 'Blockquote', tag: 'blockquote' },
  ]

  test(`should set the correct type when the button is pressed`, async ({ page }) => {
    for (const n of buttonNodes) {
      await page.locator('button').filter({ hasText: 'Paragraph' }).first().click()
      await page.locator('.tiptap').first().click()
      await typeText(page, '{selectall}Hello world{selectall}')

      await page.locator('button').filter({ hasText: n.label }).first().click()
      await expect(page.locator(`.tiptap ${n.tag}`).first()).toBeAttached()
      await expect(page.locator(`.tiptap ${n.tag}`).first()).toHaveText('Hello world')
      await page.locator('button').filter({ hasText: n.label }).first().click()
      await expect(page.locator(`.tiptap ${n.tag}`)).toHaveCount(0)
    }
  })

  test('should add a hr when on the same line as a node', async ({ page }) => {
    await page.locator('.tiptap').first().click()
    await typeText(page, '{rightArrow}')
    await page.locator('button').filter({ hasText: 'Horizontal rule' }).first().click()
    await expect(page.locator('.tiptap hr').first()).toBeAttached()
    await expect(page.locator('.tiptap h1').first()).toBeAttached()
  })

  test('should add a hr when on a new line', async ({ page }) => {
    await page.locator('.tiptap').first().click()
    await typeText(page, '{rightArrow}{enter}')
    await page.locator('button').filter({ hasText: 'Horizontal rule' }).first().click()
    await expect(page.locator('.tiptap hr').first()).toBeAttached()
    await expect(page.locator('.tiptap h1').first()).toBeAttached()
  })

  test('should add a br', async ({ page }) => {
    await page.locator('.tiptap').first().click()
    await typeText(page, '{rightArrow}')
    await page.locator('button').filter({ hasText: 'Hard break' }).first().click()
    await expect(page.locator('.tiptap br').first()).toBeAttached()
  })

  test('should undo', async ({ page }) => {
    await setEditorContent(page, '<h1>Example Text</h1>')

    await page.locator('.tiptap').first().click()
    await typeText(page, '{selectall}{backspace}')
    return new Promise(resolve => {
      setTimeout(resolve, 500)
    })

    await page.locator('button').filter({ hasText: 'Undo' }).first().click()
    await expect(page.locator('.tiptap').filter({ hasText: 'Example Text' }).first()).toBeAttached()
  })

  test('should redo', async ({ page }) => {
    await setEditorContent(page, '<h1>Example Text</h1>')

    return new Promise(resolve => {
      setTimeout(resolve, 500)
    })

    await page.locator('.tiptap').first().click()
    await typeText(page, '{selectall}{backspace}')
    await page.locator('button').filter({ hasText: 'Undo' }).first().click()
    await expect(page.locator('.tiptap').filter({ hasText: 'Example Text' }).first()).toBeAttached()
    await page.locator('button').filter({ hasText: 'Redo' }).first().click()
    await expect(page.locator('.tiptap').first()).not.toContainText('Example Text')
  })
})
