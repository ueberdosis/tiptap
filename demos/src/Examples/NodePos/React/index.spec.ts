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

test.describe('/src/Examples/NodePos/React/', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/src/Examples/NodePos/React/')
  })

  test('should get paragraphs', async ({ page }) => {
    page.locator('.tiptap')

    await page.locator('button[data-testid="find-paragraphs"]').first().click()
    await expect(page.locator('div[data-testid="found-nodes"]').first()).toBeAttached()
    await expect(page.locator('div[data-testid="found-node"]')).toHaveCount(16)
  })

  test('should get list items', async ({ page }) => {
    page.locator('.tiptap')

    await page.locator('button[data-testid="find-listitems"]').first().click()
    await expect(page.locator('div[data-testid="found-nodes"]').first()).toBeAttached()
    await expect(page.locator('div[data-testid="found-node"]')).toHaveCount(12)
  })

  test('should get bullet lists', async ({ page }) => {
    page.locator('.tiptap')

    await page.locator('button[data-testid="find-bulletlists"]').first().click()
    await expect(page.locator('div[data-testid="found-nodes"]').first()).toBeAttached()
    await expect(page.locator('div[data-testid="found-node"]')).toHaveCount(3)
  })

  test('should get ordered lists', async ({ page }) => {
    page.locator('.tiptap')

    await page.locator('button[data-testid="find-orderedlists"]').first().click()
    await expect(page.locator('div[data-testid="found-nodes"]').first()).toBeAttached()
    await expect(page.locator('div[data-testid="found-node"]')).toHaveCount(1)
  })

  test('should get blockquotes', async ({ page }) => {
    page.locator('.tiptap')

    await page.locator('button[data-testid="find-blockquotes"]').first().click()
    await expect(page.locator('div[data-testid="found-nodes"]').first()).toBeAttached()
    await expect(page.locator('div[data-testid="found-node"]')).toHaveCount(3)
  })

  test('should get images', async ({ page }) => {
    page.locator('.tiptap')

    await page.locator('button[data-testid="find-images"]').first().click()
    await expect(page.locator('div[data-testid="found-nodes"]').first()).toBeAttached()
    await expect(page.locator('div[data-testid="found-node"]')).toHaveCount(4)
  })

  test('should get first blockquote', async ({ page }) => {
    page.locator('.tiptap')

    await page.locator('button[data-testid="find-first-blockquote"]').first().click()
    await expect(page.locator('div[data-testid="found-nodes"]').first()).toBeAttached()
    await expect(page.locator('div[data-testid="found-node"]')).toHaveCount(1)
    await expect(
      page
        .locator('div[data-testid="found-node"]')
        .filter({ hasText: 'Here we have a paragraph inside a blockquote.' })
        .first(),
    ).toBeAttached()
    await expect(page.locator('div[data-testid="found-node"]').first()).not.toContainText(
      'Here we have another paragraph inside a blockquote.',
    )
  })

  test.describe('when querying by attribute', () => {
    test('should get square image', async ({ page }) => {
      page.locator('.tiptap')

      await page.locator('button[data-testid="find-squared-image"]').first().click()
      await expect(page.locator('div[data-testid="found-nodes"]').first()).toBeAttached()
      await expect(page.locator('div[data-testid="found-node"]')).toHaveCount(1)
      await expect(
        page.locator('div[data-testid="found-node"]').filter({ hasText: 'https://placehold.co/200x200' }).first(),
      ).toBeAttached()
    })

    test('should get landsape image', async ({ page }) => {
      page.locator('.tiptap')

      await page.locator('button[data-testid="find-landscape-image"]').first().click()
      await expect(page.locator('div[data-testid="found-nodes"]').first()).toBeAttached()
      await expect(page.locator('div[data-testid="found-node"]')).toHaveCount(1)
      await expect(
        page.locator('div[data-testid="found-node"]').filter({ hasText: 'https://placehold.co/260x200' }).first(),
      ).toBeAttached()
    })

    test('should get all landscape images', async ({ page }) => {
      page.locator('.tiptap')

      await page.locator('button[data-testid="find-all-landscape-images"]').first().click()
      await expect(page.locator('div[data-testid="found-nodes"]').first()).toBeAttached()
      await expect(page.locator('div[data-testid="found-node"]')).toHaveCount(2)
      await expect(
        page
          .locator('div[data-testid="found-node"]')
          .nth(0)
          .filter({ hasText: 'https://placehold.co/260x200' })
          .first(),
      ).toBeAttached()
      await expect(
        page
          .locator('div[data-testid="found-node"]')
          .nth(1)
          .filter({ hasText: 'https://placehold.co/260x200' })
          .first(),
      ).toBeAttached()
    })

    test('should get first landscape image with querySelectorAll', async ({ page }) => {
      page.locator('.tiptap')

      await page.locator('button[data-testid="find-first-landscape-image-with-all-query"]').first().click()
      await expect(page.locator('div[data-testid="found-nodes"]').first()).toBeAttached()
      await expect(page.locator('div[data-testid="found-node"]')).toHaveCount(1)
      await expect(
        page.locator('div[data-testid="found-node"]').filter({ hasText: 'https://placehold.co/260x200' }).first(),
      ).toBeAttached()
    })

    test('should get portrait image inside blockquote', async ({ page }) => {
      page.locator('.tiptap')

      await page.locator('button[data-testid="find-portrait-image-inside-blockquote"]').first().click()
      await expect(page.locator('div[data-testid="found-nodes"]').first()).toBeAttached()
      await expect(page.locator('div[data-testid="found-node"]')).toHaveCount(1)
      await expect(
        page.locator('div[data-testid="found-node"]').filter({ hasText: 'https://placehold.co/100x200' }).first(),
      ).toBeAttached()
    })
  })

  test('should find complex nodes', async ({ page }) => {
    page.locator('.tiptap')

    await page.locator('button[data-testid="find-first-node"]').first().click()
    await expect(page.locator('div[data-testid="found-nodes"]').first()).toBeAttached()
    await expect(page.locator('div[data-testid="found-node"]')).toHaveCount(1)
    await expect(page.locator('div[data-testid="found-node"]').filter({ hasText: 'heading' }).first()).toBeAttached()
    await expect(
      page.locator('div[data-testid="found-node"]').filter({ hasText: '{"level":1}' }).first(),
    ).toBeAttached()

    await page.locator('button[data-testid="find-last-node"]').first().click()
    await expect(page.locator('div[data-testid="found-nodes"]').first()).toBeAttached()
    await expect(page.locator('div[data-testid="found-node"]')).toHaveCount(1)
    await expect(page.locator('div[data-testid="found-node"]').filter({ hasText: 'image' }).first()).toBeAttached()

    await page.locator('button[data-testid="find-last-node-of-first-bullet-list"]').first().click()
    await expect(page.locator('div[data-testid="found-nodes"]').first()).toBeAttached()
    await expect(page.locator('div[data-testid="found-node"]')).toHaveCount(1)
    await expect(page.locator('div[data-testid="found-node"]').filter({ hasText: 'listItem' }).first()).toBeAttached()
    await expect(page.locator('div[data-testid="found-node"]').filter({ hasText: 'Unsorted 3' }).first()).toBeAttached()
  })

  test('should not find nodes that do not exist in document', async ({ page }) => {
    page.locator('.tiptap')

    await page.locator('button[data-testid="find-nonexistent-node"]').first().click()
    await expect(page.locator('div[data-testid="found-nodes"]')).toHaveCount(0)
    await expect(page.locator('div[data-testid="found-node"]')).toHaveCount(0)
  })
})
