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

test.describe('/src/Nodes/TaskList/React/', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/src/Nodes/TaskList/React/')
  })

  test.beforeEach(async ({ page }) => {
    await setEditorContent(page, '<p>Example Text</p>')
    await page.locator('.tiptap').first().click()
    await typeText(page, '{selectall}')
  })

  test('should parse unordered lists correctly', async ({ page }) => {
    await setEditorContent(
      page,
      '<ul data-type="taskList"><li data-checked="true" data-type="taskItem"><p>Example Text</p></li></ul>',
    )
    expect(await getEditorHTML(page)).toBe(
      '<ul data-type="taskList"><li data-checked="true" data-type="taskItem"><label><input type="checkbox" checked="checked"><span></span></label><div><p>Example Text</p></div></li></ul>',
    )
  })

  test('should parse unordered lists without paragraphs correctly', async ({ page }) => {
    await setEditorContent(
      page,
      '<ul data-type="taskList"><li data-checked="false" data-type="taskItem">Example Text</li></ul>',
    )
    expect(await getEditorHTML(page)).toBe(
      '<ul data-type="taskList"><li data-checked="false" data-type="taskItem"><label><input type="checkbox"><span></span></label><div><p>Example Text</p></div></li></ul>',
    )
  })

  test('the button should make the selected line a task list item', async ({ page }) => {
    await expect(page.locator('.tiptap ul')).toHaveCount(0)

    await expect(page.locator('.tiptap ul li')).toHaveCount(0)

    await page.locator('button:nth-child(1)').first().click()

    await expect(page.locator('.tiptap').locator('ul[data-type="taskList"]')).toContainText('Example Text')

    await expect(page.locator('.tiptap').locator('ul[data-type="taskList"] li')).toContainText('Example Text')
  })

  test('the button should toggle the task list', async ({ page }) => {
    await expect(page.locator('.tiptap ul')).toHaveCount(0)

    await page.locator('button:nth-child(1)').first().click()

    await expect(page.locator('.tiptap').locator('ul[data-type="taskList"]')).toContainText('Example Text')

    await page.locator('button:nth-child(1)').first().click()

    await expect(page.locator('.tiptap ul')).toHaveCount(0)
  })

  test('should make the paragraph a task list when the keyboard shortcut is pressed', async ({ page }) => {
    await pressShortcut(page, { modKey: true, shiftKey: true, key: '9' })
    await expect(page.locator('.tiptap').locator('ul li')).toContainText('Example Text')
  })

  test('should leave the list with double enter', async ({ page }) => {
    await waitForEditor(page, '.tiptap')
    await page.evaluate(__expr => {
      const editor = (document.querySelector('.tiptap') as any).editor
      editor.commands.clearContent()
    }, undefined)

    await page.locator('.tiptap').first().click()
    await typeText(page, '[ ] List Item 1{enter}{enter}Paragraph')

    // TODO(playwright-migration): unhandled .its(...) on page.locator('.tiptap').locator('li')
    expect(await page.locator('.tiptap').locator('li').count()).toBe(1)

    await expect(page.locator('.tiptap').locator('p')).toContainText('Paragraph')
  })

  test('should make a task list from square brackets', async ({ page }) => {
    await waitForEditor(page, '.tiptap')
    await page.evaluate(__expr => {
      const editor = (document.querySelector('.tiptap') as any).editor
      editor.commands.clearContent()
    }, undefined)

    await page.locator('.tiptap').first().click()
    await typeText(page, '[ ] List Item 1{enter}List Item 2')

    await expect(page.locator('.tiptap').locator('li:nth-child(1)')).toContainText('List Item 1')
    await expect(page.locator('.tiptap').locator('li:nth-child(1)')).toHaveAttribute('data-checked', 'false')

    await expect(page.locator('.tiptap').locator('li:nth-child(2)')).toContainText('List Item 2')
    await expect(page.locator('.tiptap').locator('li:nth-child(2)')).toHaveAttribute('data-checked', 'false')
  })

  test('should make a task list from checked square brackets', async ({ page }) => {
    await waitForEditor(page, '.tiptap')
    await page.evaluate(__expr => {
      const editor = (document.querySelector('.tiptap') as any).editor
      editor.commands.clearContent()
    }, undefined)

    await page.locator('.tiptap').first().click()
    await typeText(page, '[x] List Item 1{enter}List Item 2')

    await expect(page.locator('.tiptap').locator('li:nth-child(1)')).toContainText('List Item 1')
    await expect(page.locator('.tiptap').locator('li:nth-child(1)')).toHaveAttribute('data-checked', 'true')

    await expect(page.locator('.tiptap').locator('li:nth-child(2)')).toContainText('List Item 2')
    await expect(page.locator('.tiptap').locator('li:nth-child(2)')).toHaveAttribute('data-checked', 'false')
  })
})
