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

test.describe('/src/Nodes/Table/React/', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/src/Nodes/Table/React/')
  })

  test.beforeEach(async ({ page }) => {
    await waitForEditor(page, '.tiptap')
    await page.evaluate(__expr => {
      const editor = (document.querySelector('.tiptap') as any).editor
      editor.commands.clearContent()
    }, undefined)
  })

  test('creates a table (1x1)', async ({ page }) => {
    await waitForEditor(page, '.tiptap')
    await page.evaluate(__expr => {
      const editor = (document.querySelector('.tiptap') as any).editor
      editor.commands.insertTable({ cols: 1, rows: 1, withHeaderRow: false })
    }, undefined)

    // TODO(playwright-migration): unhandled .its(...) on page.locator('.tiptap').locator('td')
    expect(await page.locator('.tiptap').locator('td').count()).toBe(1)
    // TODO(playwright-migration): unhandled .its(...) on page.locator('.tiptap').locator('tr')
    expect(await page.locator('.tiptap').locator('tr').count()).toBe(1)
  })

  test('creates a table (3x1)', async ({ page }) => {
    await waitForEditor(page, '.tiptap')
    await page.evaluate(__expr => {
      const editor = (document.querySelector('.tiptap') as any).editor
      editor.commands.insertTable({ cols: 3, rows: 1, withHeaderRow: false })
    }, undefined)

    // TODO(playwright-migration): unhandled .its(...) on page.locator('.tiptap').locator('td')
    expect(await page.locator('.tiptap').locator('td').count()).toBe(3)
    // TODO(playwright-migration): unhandled .its(...) on page.locator('.tiptap').locator('tr')
    expect(await page.locator('.tiptap').locator('tr').count()).toBe(1)
  })

  test('creates a table (1x3)', async ({ page }) => {
    await waitForEditor(page, '.tiptap')
    await page.evaluate(__expr => {
      const editor = (document.querySelector('.tiptap') as any).editor
      editor.commands.insertTable({ cols: 1, rows: 3, withHeaderRow: false })
    }, undefined)

    // TODO(playwright-migration): unhandled .its(...) on page.locator('.tiptap').locator('td')
    expect(await page.locator('.tiptap').locator('td').count()).toBe(3)
    // TODO(playwright-migration): unhandled .its(...) on page.locator('.tiptap').locator('tr')
    expect(await page.locator('.tiptap').locator('tr').count()).toBe(3)
  })

  test('creates a table with header row (1x3)', async ({ page }) => {
    await waitForEditor(page, '.tiptap')
    await page.evaluate(__expr => {
      const editor = (document.querySelector('.tiptap') as any).editor
      editor.commands.insertTable({ cols: 1, rows: 3, withHeaderRow: true })
    }, undefined)

    // TODO(playwright-migration): unhandled .its(...) on page.locator('.tiptap').locator('th')
    expect(await page.locator('.tiptap').locator('th').count()).toBe(1)
    // TODO(playwright-migration): unhandled .its(...) on page.locator('.tiptap').locator('td')
    expect(await page.locator('.tiptap').locator('td').count()).toBe(2)
    // TODO(playwright-migration): unhandled .its(...) on page.locator('.tiptap').locator('tr')
    expect(await page.locator('.tiptap').locator('tr').count()).toBe(3)
  })

  test('creates a table with correct defaults (3x3, th)', async ({ page }) => {
    await waitForEditor(page, '.tiptap')
    await page.evaluate(__expr => {
      const editor = (document.querySelector('.tiptap') as any).editor
      editor.commands.insertTable()
    }, undefined)

    // TODO(playwright-migration): unhandled .its(...) on page.locator('.tiptap').locator('th')
    expect(await page.locator('.tiptap').locator('th').count()).toBe(3)
    // TODO(playwright-migration): unhandled .its(...) on page.locator('.tiptap').locator('td')
    expect(await page.locator('.tiptap').locator('td').count()).toBe(6)
    // TODO(playwright-migration): unhandled .its(...) on page.locator('.tiptap').locator('tr')
    expect(await page.locator('.tiptap').locator('tr').count()).toBe(3)
  })

  test('sets the minimum width on the colgroups by default (3x1)', async ({ page }) => {
    await waitForEditor(page, '.tiptap')
    await page.evaluate(__expr => {
      const editor = (document.querySelector('.tiptap') as any).editor
      editor.commands.insertTable({ cols: 3, rows: 1, withHeaderRow: false })
    }, undefined)

    // TODO(playwright-migration): unhandled .invoke(...) on page.locator('.tiptap').locator('col')
    expect(await page.locator('.tiptap').locator('col').count()).toBe('min-width: 25px;')
  })

  test('generates correct markup for a table (1x1)', async ({ page }) => {
    await waitForEditor(page, '.tiptap')
    await page.evaluate(__expr => {
      const editor = (document.querySelector('.tiptap') as any).editor
      editor.commands.insertTable({ cols: 1, rows: 1, withHeaderRow: false })
    }, undefined)

    const html = await editorEval(page, '(await getEditorHTML(page))', '.tiptap')

    expect(html).toBe(
      '<table style="min-width: 25px"><colgroup><col style="min-width: 25px"></colgroup><tbody><tr><td colspan="1" rowspan="1"><p></p></td></tr></tbody></table>',
    )
  })

  test('generates correct markup for a table (1x1, th)', async ({ page }) => {
    await waitForEditor(page, '.tiptap')
    await page.evaluate(__expr => {
      const editor = (document.querySelector('.tiptap') as any).editor
      editor.commands.insertTable({ cols: 1, rows: 1, withHeaderRow: true })
    }, undefined)

    const html = await editorEval(page, '(await getEditorHTML(page))', '.tiptap')

    expect(html).toBe(
      '<table style="min-width: 25px"><colgroup><col style="min-width: 25px"></colgroup><tbody><tr><th colspan="1" rowspan="1"><p></p></th></tr></tbody></table>',
    )
  })
})
