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

test.describe('/src/Nodes/Mention/React/', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/src/Nodes/Mention/React/')
  })

  test('should insert a mention', async ({ page }) => {
    await setEditorContent(page, '<p><span data-type="mention" data-id="1" data-label="John Doe">@John Doe</span></p>')
    expect(await page.locator('.tiptap').first().innerHTML()).toContain(
      '<span class="mention" data-type="mention" data-id="1" data-label="John Doe" data-mention-suggestion-char="@" contenteditable="false">@John Doe</span>',
    )
  })

  test('should insert multiple mentions', async ({ page }) => {
    await waitForEditor(page, '.tiptap')
    await page.evaluate(__expr => {
      const editor = (document.querySelector('.tiptap') as any).editor
      editor.commands.setContent(
        '<p><span data-type="mention" data-id="1" data-label="John Doe">@John Doe</span> and <span data-type="mention" data-id="2" data-label="Jane Smith">@Jane Smith</span></p>',
      )
    }, undefined)
    expect(await page.locator('.tiptap').first().innerHTML()).toContain(
      '<span class="mention" data-type="mention" data-id="1" data-label="John Doe" data-mention-suggestion-char="@" contenteditable="false">@John Doe</span> and <span class="mention" data-type="mention" data-id="2" data-label="Jane Smith" data-mention-suggestion-char="@" contenteditable="false">@Jane Smith</span>',
    )
  })

  test("should open a dropdown menu when I type '@'", async ({ page }) => {
    await page.locator('.tiptap').first().click()
    await typeText(page, '{selectall}{backspace}@')
    await expect(page.locator('.dropdown-menu').first()).toBeAttached()
  })

  test('should display the correct options in the dropdown menu', async ({ page }) => {
    await page.locator('.tiptap').first().click()
    await typeText(page, '{selectall}{backspace}@')
    await expect(page.locator('.dropdown-menu').first()).toBeAttached()
    await expect(page.locator('.dropdown-menu button')).toHaveCount(5)
    await expect(
      page.locator('.dropdown-menu button:nth-child(1)').filter({ hasText: 'Lea Thompson' }).first(),
    ).toBeAttached()
    await expect(page.locator('.dropdown-menu button:nth-child(1)').first()).toHaveClass(
      new RegExp('(^|\\s)' + 'is-selected' + '(\\s|$)'),
    )
    await expect(
      page.locator('.dropdown-menu button:nth-child(2)').filter({ hasText: 'Cyndi Lauper' }).first(),
    ).toBeAttached()
    await expect(
      page.locator('.dropdown-menu button:nth-child(3)').filter({ hasText: 'Tom Cruise' }).first(),
    ).toBeAttached()
    await expect(
      page.locator('.dropdown-menu button:nth-child(4)').filter({ hasText: 'Madonna' }).first(),
    ).toBeAttached()
    await expect(
      page.locator('.dropdown-menu button:nth-child(5)').filter({ hasText: 'Jerry Hall' }).first(),
    ).toBeAttached()
  })

  test('should insert Cyndi Lauper mention when clicking on her option', async ({ page }) => {
    await page.locator('.tiptap').first().click()
    await typeText(page, '{selectall}{backspace}@')
    await expect(page.locator('.dropdown-menu').first()).toBeAttached()
    await page.locator('.dropdown-menu button:nth-child(2)').filter({ hasText: 'Cyndi Lauper' }).first().click()

    expect(await page.locator('.tiptap').first().innerHTML()).toContain(
      '<span class="mention" data-type="mention" data-id="Cyndi Lauper" data-mention-suggestion-char="@" contenteditable="false">@Cyndi Lauper</span>',
    )
  })

  test('should close the dropdown menu when I move the cursor outside the editor', async ({ page }) => {
    await page.locator('.tiptap').first().click()
    await typeText(page, '{selectall}{backspace}@')
    await expect(page.locator('.dropdown-menu').first()).toBeAttached()
    await page.locator('.tiptap').first().click()
    await typeText(page, '{moveToStart}')
    await expect(page.locator('.dropdown-menu')).toHaveCount(0)
  })

  test('should close the dropdown menu when I press the exit key', async ({ page }) => {
    await page.locator('.tiptap').first().click()
    await typeText(page, '{selectall}{backspace}@')
    await expect(page.locator('.dropdown-menu').first()).toBeAttached()
    await page.locator('.tiptap').first().click()
    await typeText(page, '{esc}')
    await expect(page.locator('.dropdown-menu')).toHaveCount(0)
  })

  test('should insert Tom Cruise when selecting his option with the arrow keys and pressing the enter key', async ({
    page,
  }) => {
    await page.locator('.tiptap').first().click()
    await typeText(page, '{selectall}{backspace}@')
    await expect(page.locator('.dropdown-menu').first()).toBeAttached()
    await page.locator('.tiptap').first().click()
    await typeText(page, '{downarrow}{downarrow}')
    await expect(page.locator('.dropdown-menu button:nth-child(3)').first()).toHaveClass(
      new RegExp('(^|\\s)' + 'is-selected' + '(\\s|$)'),
    )
    await page.locator('.tiptap').first().click()
    await typeText(page, '{enter}')

    expect(await page.locator('.tiptap').first().innerHTML()).toContain(
      '<span class="mention" data-type="mention" data-id="Tom Cruise" data-mention-suggestion-char="@" contenteditable="false">@Tom Cruise</span>',
    )
  })

  test('should show a "No result" message when I search for an option that is not in the list', async ({ page }) => {
    await page.locator('.tiptap').first().click()
    await typeText(page, '{selectall}{backspace}@nonexistent')
    await expect(page.locator('.dropdown-menu').first()).toBeAttached()
    await expect(page.locator('.dropdown-menu').filter({ hasText: 'No result' }).first()).toBeAttached()
  })

  test('should not hide the dropdown or insert any mention if I search for an option that is not in the list and hit enter', async ({
    page,
  }) => {
    await page.locator('.tiptap').first().click()
    await typeText(page, '{selectall}{backspace}@nonexistent')
    await expect(page.locator('.dropdown-menu').first()).toBeAttached()
    await expect(page.locator('.dropdown-menu').filter({ hasText: 'No result' }).first()).toBeAttached()
    await page.locator('.tiptap').first().click()
    await typeText(page, '{enter}')
    await expect(page.locator('.dropdown-menu').first()).toBeAttached()
    await expect(page.locator('.tiptap').first()).toHaveText('@nonexistent')
    await expect(page.locator('.tiptap span.mention')).toHaveCount(0)
  })

  test('should only show the Madonna option in the dropdown when I type "@mado"', async ({ page }) => {
    await page.locator('.tiptap').first().click()
    await typeText(page, '{selectall}{backspace}@mado')
    await expect(page.locator('.dropdown-menu').first()).toBeAttached()
    await expect(page.locator('.dropdown-menu button')).toHaveCount(1)
    await expect(
      page.locator('.dropdown-menu button:nth-child(1)').filter({ hasText: 'Madonna' }).first(),
    ).toBeAttached()
  })

  test('should insert Madonna when I type "@mado" and hit enter', async ({ page }) => {
    await page.locator('.tiptap').first().click()
    await typeText(page, '{selectall}{backspace}@mado{enter}')
    expect(await page.locator('.tiptap').first().innerHTML()).toContain(
      '<span class="mention" data-type="mention" data-id="Madonna" data-mention-suggestion-char="@" contenteditable="false">@Madonna</span>',
    )
  })
})
