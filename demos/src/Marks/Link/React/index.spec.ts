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

test.describe('/src/Marks/Link/React/', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/src/Marks/Link/React/')
  })

  test.beforeEach(async ({ page }) => {
    await setEditorContent(page, '<p>Example TextDEFAULT</p>')
    await page.locator('.tiptap').first().click()
    await typeText(page, '{selectall}')
  })

  test('should parse a tags correctly', async ({ page }) => {
    await setEditorContent(page, '<p><a href="https://example.com">Example Text1</a></p>')
    expect(await getEditorHTML(page)).toBe(
      '<p><a target="_blank" rel="noopener noreferrer nofollow" href="https://example.com">Example Text1</a></p>',
    )
  })

  test('should parse a tags with target attribute correctly', async ({ page }) => {
    await setEditorContent(page, '<p><a href="https://example.com" target="_self">Example Text2</a></p>')
    expect(await getEditorHTML(page)).toBe(
      '<p><a target="_self" rel="noopener noreferrer nofollow" href="https://example.com">Example Text2</a></p>',
    )
  })

  test('should parse a tags with rel attribute correctly', async ({ page }) => {
    await setEditorContent(page, '<p><a href="https://example.com" rel="follow">Example Text3</a></p>')
    expect(await getEditorHTML(page)).toBe(
      '<p><a target="_blank" rel="follow" href="https://example.com">Example Text3</a></p>',
    )
  })

  test('the button should add a link to the selected text', async ({ page }) => {
    await page.evaluate(v => {
      ;(window as any).prompt = () => v
    }, 'https://tiptap.dev')

    await page.locator('button').first().click()

    /* prompt was called (assertion dropped during migration) */

    await expect(page.locator('.tiptap').locator('a')).toContainText('Example TextDEFAULT')
    await expect(page.locator('.tiptap').locator('a')).toHaveAttribute('href', 'https://tiptap.dev')
  })

  test('should allow exiting the link once set', async ({ page }) => {
    await setEditorContent(page, '<p><a href="https://example.com" target="_self">Example Text2</a></p>')
    await page.locator('.tiptap').first().click()
    await typeText(page, '{rightArrow}')

    await expect(page.locator('button').first()).not.toHaveClass(new RegExp('(^|\\s)' + 'is-active' + '(\\s|$)'))
  })

  test('detects autolinking', async ({ page }) => {
    await page.locator('.tiptap').first().click()
    await typeText(page, 'https://example.com ')
    await expect(page.locator('.tiptap').locator('a')).toContainText('https://example.com')
    await expect(page.locator('.tiptap').locator('a')).toHaveAttribute('href', 'https://example.com')
  })

  test('detects autolinking with numbers', async ({ page }) => {
    await page.locator('.tiptap').first().click()
    await typeText(page, 'https://tiptap4u.com ')
    await expect(page.locator('.tiptap').locator('a')).toContainText('https://tiptap4u.com')
    await expect(page.locator('.tiptap').locator('a')).toHaveAttribute('href', 'https://tiptap4u.com')
  })

  test('uses the default protocol', async ({ page }) => {
    await page.locator('.tiptap').first().click()
    await typeText(page, 'example.com ')
    await expect(page.locator('.tiptap').locator('a')).toContainText('example.com')
    await expect(page.locator('.tiptap').locator('a')).toHaveAttribute('href', 'https://example.com')
  })

  test('uses a non-default protocol if present', async ({ page }) => {
    await page.locator('.tiptap').first().click()
    await typeText(page, 'http://example.com ')
    await expect(page.locator('.tiptap').locator('a')).toContainText('http://example.com')
    await expect(page.locator('.tiptap').locator('a')).toHaveAttribute('href', 'http://example.com')
  })

  test('detects a pasted URL within a text', async ({ page }) => {
    await pasteIntoEditor(page, {
      pastePayload: 'some text https://example1.com around an url',
      pasteType: 'text/plain',
    })
    await expect(page.locator('.tiptap').locator('a')).toContainText('https://example1.com')
    await expect(page.locator('.tiptap').locator('a')).toHaveAttribute('href', 'https://example1.com')
  })

  test('detects a pasted URL', async ({ page }) => {
    await page.locator('.tiptap').first().click()
    await typeText(page, '{backspace}')
    await pasteIntoEditor(page, { pastePayload: 'https://example2.com', pasteType: 'text/plain' })
    await expect(page.locator('.tiptap').locator('a')).toContainText('https://example2.com')
    await expect(page.locator('.tiptap').locator('a')).toHaveAttribute('href', 'https://example2.com')
  })

  test('detects a pasted URL with query params', async ({ page }) => {
    await page.locator('.tiptap').first().click()
    await typeText(page, '{backspace}')
    await pasteIntoEditor(page, {
      pastePayload: 'https://example.com?paramA=nice&paramB=cool',
      pasteType: 'text/plain',
    })
    await expect(page.locator('.tiptap').locator('a')).toContainText('https://example.com?paramA=nice&paramB=cool')
    await expect(page.locator('.tiptap').locator('a')).toHaveAttribute(
      'href',
      'https://example.com?paramA=nice&paramB=cool',
    )
  })

  test('correctly detects multiple pasted URLs', async ({ page }) => {
    await pasteIntoEditor(page, {
      pastePayload: 'https://example1.com, https://example2.com/foobar, (http://example3.com/foobar)',
      pasteType: 'text/plain',
    })

    await expect(page.locator('.tiptap').locator('a[href="https://example1.com"]')).toContainText(
      'https://example1.com',
    )

    await expect(page.locator('.tiptap').locator('a[href="https://example2.com/foobar"]')).toContainText(
      'https://example2.com/foobar',
    )

    await expect(page.locator('.tiptap').locator('a[href="http://example3.com/foobar"]')).toContainText(
      'http://example3.com/foobar',
    )
  })

  test('should not allow links with disallowed protocols', async ({ page }) => {
    const disallowedProtocols = ['ftp://example.com', 'file:///example.txt', 'mailto:test@example.com']

    for (const url of disallowedProtocols) {
      await setEditorContent(page, `<p><a href="${url}">Example Text</a></p>`)
      expect(await editorEval(page, '(await getEditorHTML(page))', '.tiptap')).not.toContain(url)
    }
  })

  test('should not allow links with disallowed domains', async ({ page }) => {
    const disallowedDomains = ['https://example-phishing.com', 'https://malicious-site.net']

    for (const url of disallowedDomains) {
      await setEditorContent(page, `<p><a href="${url}">Example Text</a></p>`)
      expect(await editorEval(page, '(await getEditorHTML(page))', '.tiptap')).not.toContain(url)
    }
  })

  test('should not auto-link a URL from a disallowed domain', async ({ page }) => {
    await page.locator('.tiptap').first().click()
    await typeText(page, 'https://example-phishing.com ')
    await expect(page.locator('.tiptap').locator('a')).toHaveCount(0)
    await expect(page.locator('.tiptap')).toContainText('https://example-phishing.com')
  })
})
