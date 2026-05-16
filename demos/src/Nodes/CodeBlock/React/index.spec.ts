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

test.describe('/src/Nodes/CodeBlock/React/', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/src/Nodes/CodeBlock/React/')
  })

  test.beforeEach(async ({ page }) => {
    await setEditorContent(page, '<p>Example Text</p>')
    await page.locator('.tiptap').first().click()
    await typeText(page, '{selectall}')
  })

  test('should parse code blocks correctly', async ({ page }) => {
    await setEditorContent(page, '<pre><code>Example Text</code></pre>')
    expect(await getEditorHTML(page)).toBe('<pre><code>Example Text</code></pre>')
  })

  test('should parse code blocks with language correctly', async ({ page }) => {
    await setEditorContent(page, '<pre><code class="language-css">Example Text</code></pre>')
    expect(await getEditorHTML(page)).toBe('<pre><code class="language-css">Example Text</code></pre>')
  })

  test('the button should make the selected line a code block', async ({ page }) => {
    await page.locator('button').first().click()

    await expect(page.locator('.tiptap').locator('pre').filter({ hasText: 'Example Text' }).first()).toBeAttached()
  })

  test('the button should toggle the code block', async ({ page }) => {
    await page.locator('button').first().click()

    await expect(page.locator('.tiptap').locator('pre').filter({ hasText: 'Example Text' }).first()).toBeAttached()

    await page.locator('.tiptap').first().click()
    await typeText(page, '{selectall}')

    await page.locator('button').first().click()

    await expect(page.locator('.tiptap pre')).toHaveCount(0)
  })

  test('the keyboard shortcut should make the selected line a code block', async ({ page }) => {
    await pressShortcut(page, { modKey: true, altKey: true, key: 'c' })
    await expect(page.locator('.tiptap').locator('pre').filter({ hasText: 'Example Text' }).first()).toBeAttached()
  })

  test('the keyboard shortcut should toggle the code block', async ({ page }) => {
    await pressShortcut(page, { modKey: true, altKey: true, key: 'c' })
    await expect(page.locator('.tiptap').locator('pre').filter({ hasText: 'Example Text' }).first()).toBeAttached()

    await page.locator('.tiptap').first().click()
    await typeText(page, '{selectall}')
    await pressShortcut(page, { modKey: true, altKey: true, key: 'c' })

    await expect(page.locator('.tiptap pre')).toHaveCount(0)
  })

  test('should parse the language from a HTML code block', async ({ page }) => {
    await setEditorContent(page, '<pre><code class="language-css">body { display: none; }</code></pre>')

    await expect(page.locator('.tiptap').locator('pre>code.language-css')).toHaveCount(1)
  })

  test('should make a code block from backtick markdown shortcuts', async ({ page }) => {
    await waitForEditor(page, '.tiptap')
    await page.evaluate(__expr => {
      const editor = (document.querySelector('.tiptap') as any).editor
      editor.commands.clearContent()
    }, undefined)

    await page.locator('.tiptap').first().click()
    await typeText(page, '``` Code')
    await expect(page.locator('.tiptap').locator('pre>code').filter({ hasText: 'Code' }).first()).toBeAttached()
  })

  test('should make a code block from tilde markdown shortcuts', async ({ page }) => {
    await waitForEditor(page, '.tiptap')
    await page.evaluate(__expr => {
      const editor = (document.querySelector('.tiptap') as any).editor
      editor.commands.clearContent()
    }, undefined)

    await page.locator('.tiptap').first().click()
    await typeText(page, '~~~ Code')
    await expect(page.locator('.tiptap').locator('pre>code').filter({ hasText: 'Code' }).first()).toBeAttached()
  })

  test('should make a code block for js with backticks', async ({ page }) => {
    await waitForEditor(page, '.tiptap')
    await page.evaluate(__expr => {
      const editor = (document.querySelector('.tiptap') as any).editor
      editor.commands.clearContent()
    }, undefined)

    await page.locator('.tiptap').first().click()
    await typeText(page, '```js Code')
    await expect(
      page.locator('.tiptap').locator('pre>code.language-js').filter({ hasText: 'Code' }).first(),
    ).toBeAttached()
  })

  test('should make a code block for js with tildes', async ({ page }) => {
    await waitForEditor(page, '.tiptap')
    await page.evaluate(__expr => {
      const editor = (document.querySelector('.tiptap') as any).editor
      editor.commands.clearContent()
    }, undefined)

    await page.locator('.tiptap').first().click()
    await typeText(page, '~~~js Code')
    await expect(
      page.locator('.tiptap').locator('pre>code.language-js').filter({ hasText: 'Code' }).first(),
    ).toBeAttached()
  })

  test('should make a code block from backtick markdown shortcuts followed by enter', async ({ page }) => {
    await waitForEditor(page, '.tiptap')
    await page.evaluate(__expr => {
      const editor = (document.querySelector('.tiptap') as any).editor
      editor.commands.clearContent()
    }, undefined)

    await page.locator('.tiptap').first().click()
    await typeText(page, '```{enter}Code')
    await expect(page.locator('.tiptap').locator('pre>code').filter({ hasText: 'Code' }).first()).toBeAttached()
  })

  test('reverts the markdown shortcut when pressing backspace', async ({ page }) => {
    await waitForEditor(page, '.tiptap')
    await page.evaluate(__expr => {
      const editor = (document.querySelector('.tiptap') as any).editor
      editor.commands.clearContent()
    }, undefined)

    await page.locator('.tiptap').first().click()
    await typeText(page, '``` {backspace}')

    await expect(page.locator('.tiptap pre')).toHaveCount(0)
  })

  test('removes the code block when pressing backspace', async ({ page }) => {
    await waitForEditor(page, '.tiptap')
    await page.evaluate(__expr => {
      const editor = (document.querySelector('.tiptap') as any).editor
      editor.commands.clearContent()
    }, undefined)

    await expect(page.locator('.tiptap pre')).toHaveCount(0)

    await page.locator('.tiptap').first().click()
    await typeText(page, 'Paragraph{enter}``` A{backspace}{backspace}')

    await expect(page.locator('.tiptap pre')).toHaveCount(0)
  })

  test('removes the code block when pressing backspace, even with blank lines', async ({ page }) => {
    await waitForEditor(page, '.tiptap')
    await page.evaluate(__expr => {
      const editor = (document.querySelector('.tiptap') as any).editor
      editor.commands.clearContent()
    }, undefined)

    await expect(page.locator('.tiptap pre')).toHaveCount(0)

    await page.locator('.tiptap').first().click()
    await typeText(page, 'Paragraph{enter}{enter}``` A{backspace}{backspace}')

    await expect(page.locator('.tiptap pre')).toHaveCount(0)
  })

  test('removes the code block when pressing backspace, even at start of document', async ({ page }) => {
    await waitForEditor(page, '.tiptap')
    await page.evaluate(__expr => {
      const editor = (document.querySelector('.tiptap') as any).editor
      editor.commands.clearContent()
    }, undefined)

    await expect(page.locator('.tiptap pre')).toHaveCount(0)

    await page.locator('.tiptap').first().click()
    await typeText(page, '``` A{leftArrow}{backspace}')

    await expect(page.locator('.tiptap pre')).toHaveCount(0)
  })
})
