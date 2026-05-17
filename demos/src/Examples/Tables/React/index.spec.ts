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

test.describe('/src/Examples/Tables/React/', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/src/Examples/Tables/React/')
  })

  test.beforeEach(async ({ page }) => {
    await waitForEditor(page, '.tiptap')
    await page.evaluate(__expr => {
      const editor = (document.querySelector('.tiptap') as any).editor
      editor.commands.clearContent()
    }, undefined)
    await page.locator('button').filter({ hasText: 'Insert table' }).first().click()
  })

  test('adds a table with three columns and three rows', async ({ page }) => {
    await expect(page.locator('.tiptap table').first()).toBeAttached()

    await expect(page.locator('.tiptap table tr').first()).toBeAttached()
    await expect(page.locator('.tiptap table tr')).toHaveCount(3)

    await expect(page.locator('.tiptap table th').first()).toBeAttached()
    await expect(page.locator('.tiptap table th')).toHaveCount(3)

    await expect(page.locator('.tiptap table td').first()).toBeAttached()
    await expect(page.locator('.tiptap table td')).toHaveCount(6)
  })

  test('adds & delete columns', async ({ page }) => {
    await page.locator('button').filter({ hasText: 'Add column before' }).first().click()
    await expect(page.locator('.tiptap table th')).toHaveCount(4)

    await page.locator('button').filter({ hasText: 'Add column after' }).first().click()
    await expect(page.locator('.tiptap table th')).toHaveCount(5)

    await page.locator('button').filter({ hasText: 'Delete column' }).first().click()
    await page.locator('button').filter({ hasText: 'Delete column' }).first().click()
    await expect(page.locator('.tiptap table th')).toHaveCount(3)
  })

  test('adds & delete rows', async ({ page }) => {
    await page.locator('button').filter({ hasText: 'Add row before' }).first().click()
    await expect(page.locator('.tiptap table tr')).toHaveCount(4)

    await page.locator('button').filter({ hasText: 'Add row after' }).first().click()
    await expect(page.locator('.tiptap table tr')).toHaveCount(5)

    await page.locator('button').filter({ hasText: 'Delete row' }).first().click()
    await page.locator('button').filter({ hasText: 'Delete row' }).first().click()
    await expect(page.locator('.tiptap table tr')).toHaveCount(3)
  })

  test('should delete table', async ({ page }) => {
    await page.locator('button').filter({ hasText: 'Delete table' }).first().click()
    await expect(page.locator('.tiptap table')).toHaveCount(0)
  })

  test('should merge cells', async ({ page }) => {
    await page.locator('.tiptap').first().click()
    await typeText(page, '{shift}{rightArrow}')
    await page.locator('button').filter({ hasText: 'Merge cells' }).first().click()
    await expect(page.locator('.tiptap table th')).toHaveCount(2)
  })

  test('should split cells', async ({ page }) => {
    await page.locator('.tiptap').first().click()
    await typeText(page, '{shift}{rightArrow}')
    await page.locator('button').filter({ hasText: 'Merge cells' }).first().click()
    await expect(page.locator('.tiptap table th')).toHaveCount(2)
    await page.locator('button').filter({ hasText: 'Split cell' }).first().click()
    await expect(page.locator('.tiptap table th')).toHaveCount(3)
  })

  test('should toggle header columns', async ({ page }) => {
    await waitForEditor(page, '.tiptap')
    await page.evaluate(__expr => {
      const editor = (document.querySelector('.tiptap') as any).editor
      editor.commands.toggleHeaderColumn()
    }, undefined)
    await expect(page.locator('.tiptap table th')).toHaveCount(5)
  })

  test('should toggle header row', async ({ page }) => {
    await waitForEditor(page, '.tiptap')
    await page.evaluate(__expr => {
      const editor = (document.querySelector('.tiptap') as any).editor
      editor.commands.toggleHeaderRow()
    }, undefined)
    await expect(page.locator('.tiptap table th')).toHaveCount(0)
  })

  test('should merge split', async ({ page }) => {
    await page.locator('.tiptap').first().click()
    await typeText(page, '{shift}{rightArrow}')
    await page.locator('button').filter({ hasText: 'Merge cells' }).first().click()
    await expect(page.locator('.tiptap th[colspan="2"]').first()).toBeAttached()
    await page.locator('button').filter({ hasText: 'Merge or split' }).first().click()
    await expect(page.locator('.tiptap th[colspan="2"]')).toHaveCount(0)
  })

  test('should set cell attribute', async ({ page }) => {
    await page.locator('.tiptap').first().click()
    await typeText(page, '{downArrow}')
    await page.locator('button').filter({ hasText: 'Set cell attribute' }).first().click()
    await expect(page.locator('.tiptap table td[style]').first()).toHaveAttribute('style', 'background-color: #FAF594')
  })

  test('should move focus to next or prev cell', async ({ page }) => {
    await page.locator('.tiptap').first().click()
    await typeText(page, 'Column 1')
    await page.locator('button').filter({ hasText: 'Go to next cell' }).first().click()
    await page.locator('.tiptap').first().click()
    await typeText(page, 'Column 2')
    await page.locator('button').filter({ hasText: 'Go to previous cell' }).first().click()

    {
      const elements = await page
        .locator('.tiptap th')
        .evaluateAll(els =>
          els.map(el => ({
            innerText: (el as HTMLElement).innerText,
            textContent: el.textContent ?? '',
            outerHTML: el.outerHTML,
            className: (el as HTMLElement).className,
            tagName: el.tagName,
            value: (el as HTMLInputElement).value ?? null,
            src: (el as HTMLImageElement).src ?? null,
            href: (el as HTMLAnchorElement).href ?? null,
          })),
        )

      expect(elements[0].innerText).toBe('Column 1')
      expect(elements[1].innerText).toBe('Column 2')
    }
  })
})
