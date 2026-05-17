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

test.describe('/src/Examples/MultiMention/React/', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/src/Examples/MultiMention/React/')
  })

  test.describe('Person mentions (@)', () => {
    test('should insert a person mention', async ({ page }) => {
      await setEditorContent(page, '<p><span data-type="mention" data-id="Lea Thompson">@Lea Thompson</span></p>')
      expect(await page.locator('.tiptap').first().innerHTML()).toContain(
        '<span class="mention" data-type="mention" data-id="Lea Thompson" data-mention-suggestion-char="@" contenteditable="false">@Lea Thompson</span>',
      )
    })

    test("should open a dropdown menu when I type '@'", async ({ page }) => {
      await page.locator('.tiptap').first().click()
      await typeText(page, '{selectall}{backspace}@')
      await expect(page.locator('.dropdown-menu').first()).toBeAttached()
    })

    test('should display the correct person options in the dropdown menu', async ({ page }) => {
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

    test('should close the dropdown menu when I press the escape key', async ({ page }) => {
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

    test('should show a "No result" message when I search for a person that is not in the list', async ({ page }) => {
      await page.locator('.tiptap').first().click()
      await typeText(page, '{selectall}{backspace}@nonexistent')
      await expect(page.locator('.dropdown-menu').first()).toBeAttached()
      await expect(page.locator('.dropdown-menu').filter({ hasText: 'No result' }).first()).toBeAttached()
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

  test.describe('Movie mentions (#)', () => {
    test('should insert a movie mention', async ({ page }) => {
      await waitForEditor(page, '.tiptap')
      await page.evaluate(__expr => {
        const editor = (document.querySelector('.tiptap') as any).editor
        editor.commands.setContent(
          '<p><span data-type="mention" data-id="The Matrix" data-mention-suggestion-char="#">#The Matrix</span></p>',
        )
      }, undefined)
      expect(await page.locator('.tiptap').first().innerHTML()).toContain(
        '<span class="mention" data-type="mention" data-id="The Matrix" data-mention-suggestion-char="#" contenteditable="false">#The Matrix</span>',
      )
    })

    test("should open a dropdown menu when I type '#'", async ({ page }) => {
      await page.locator('.tiptap').first().click()
      await typeText(page, '{selectall}{backspace}#')
      await expect(page.locator('.dropdown-menu').first()).toBeAttached()
    })

    test('should display the correct movie options in the dropdown menu', async ({ page }) => {
      await page.locator('.tiptap').first().click()
      await typeText(page, '{selectall}{backspace}#')
      await expect(page.locator('.dropdown-menu').first()).toBeAttached()
      await expect(page.locator('.dropdown-menu button')).toHaveCount(3)
      await expect(
        page.locator('.dropdown-menu button:nth-child(1)').filter({ hasText: 'Dirty Dancing' }).first(),
      ).toBeAttached()
      await expect(page.locator('.dropdown-menu button:nth-child(1)').first()).toHaveClass(
        new RegExp('(^|\\s)' + 'is-selected' + '(\\s|$)'),
      )
      await expect(
        page.locator('.dropdown-menu button:nth-child(2)').filter({ hasText: 'Pirates of the Caribbean' }).first(),
      ).toBeAttached()
      await expect(
        page.locator('.dropdown-menu button:nth-child(3)').filter({ hasText: 'The Matrix' }).first(),
      ).toBeAttached()
    })

    test('should insert Pirates of the Caribbean mention when clicking on its option', async ({ page }) => {
      await page.locator('.tiptap').first().click()
      await typeText(page, '{selectall}{backspace}#')
      await expect(page.locator('.dropdown-menu').first()).toBeAttached()
      await page
        .locator('.dropdown-menu button:nth-child(2)')
        .filter({ hasText: 'Pirates of the Caribbean' })
        .first()
        .click()

      expect(await page.locator('.tiptap').first().innerHTML()).toContain(
        '<span class="mention" data-type="mention" data-id="Pirates of the Caribbean" data-mention-suggestion-char="#" contenteditable="false">#Pirates of the Caribbean</span>',
      )
    })

    test('should close the dropdown menu when I move the cursor outside the editor (2)', async ({ page }) => {
      await page.locator('.tiptap').first().click()
      await typeText(page, '{selectall}{backspace}#')
      await expect(page.locator('.dropdown-menu').first()).toBeAttached()
      await page.locator('.tiptap').first().click()
      await typeText(page, '{moveToStart}')
      await expect(page.locator('.dropdown-menu')).toHaveCount(0)
    })

    test('should close the dropdown menu when I press the escape key (2)', async ({ page }) => {
      await page.locator('.tiptap').first().click()
      await typeText(page, '{selectall}{backspace}#')
      await expect(page.locator('.dropdown-menu').first()).toBeAttached()
      await page.locator('.tiptap').first().click()
      await typeText(page, '{esc}')
      await expect(page.locator('.dropdown-menu')).toHaveCount(0)
    })

    test('should insert The Matrix when selecting its option with the arrow keys and pressing the enter key', async ({
      page,
    }) => {
      await page.locator('.tiptap').first().click()
      await typeText(page, '{selectall}{backspace}#')
      await expect(page.locator('.dropdown-menu').first()).toBeAttached()
      await page.locator('.tiptap').first().click()
      await typeText(page, '{downarrow}{downarrow}')
      await expect(page.locator('.dropdown-menu button:nth-child(3)').first()).toHaveClass(
        new RegExp('(^|\\s)' + 'is-selected' + '(\\s|$)'),
      )
      await page.locator('.tiptap').first().click()
      await typeText(page, '{enter}')

      expect(await page.locator('.tiptap').first().innerHTML()).toContain(
        '<span class="mention" data-type="mention" data-id="The Matrix" data-mention-suggestion-char="#" contenteditable="false">#The Matrix</span>',
      )
    })

    test('should show a "No result" message when I search for a movie that is not in the list', async ({ page }) => {
      await page.locator('.tiptap').first().click()
      await typeText(page, '{selectall}{backspace}#nonexistent')
      await expect(page.locator('.dropdown-menu').first()).toBeAttached()
      await expect(page.locator('.dropdown-menu').filter({ hasText: 'No result' }).first()).toBeAttached()
    })

    test('should only show the Dirty Dancing option in the dropdown when I type "#dir"', async ({ page }) => {
      await page.locator('.tiptap').first().click()
      await typeText(page, '{selectall}{backspace}#dir')
      await expect(page.locator('.dropdown-menu').first()).toBeAttached()
      await expect(page.locator('.dropdown-menu button')).toHaveCount(1)
      await expect(
        page.locator('.dropdown-menu button:nth-child(1)').filter({ hasText: 'Dirty Dancing' }).first(),
      ).toBeAttached()
    })

    test('should insert Dirty Dancing when I type "#dir" and hit enter', async ({ page }) => {
      await page.locator('.tiptap').first().click()
      await typeText(page, '{selectall}{backspace}#dir{enter}')
      expect(await page.locator('.tiptap').first().innerHTML()).toContain(
        '<span class="mention" data-type="mention" data-id="Dirty Dancing" data-mention-suggestion-char="#" contenteditable="false">#Dirty Dancing</span>',
      )
    })
  })

  test.describe('Interaction between mention types', () => {
    test('should support both mention types in the same document', async ({ page }) => {
      await waitForEditor(page, '.tiptap')
      await page.evaluate(__expr => {
        const editor = (document.querySelector('.tiptap') as any).editor
        editor.commands.setContent(
          '<p><span data-type="mention" data-id="Madonna">@Madonna</span> starred in <span data-type="mention" data-id="Dirty Dancing" data-mention-suggestion-char="#">#Dirty Dancing</span></p>',
        )
      }, undefined)

      expect(await page.locator('.tiptap').first().innerHTML()).toContain(
        '<span class="mention" data-type="mention" data-id="Madonna" data-mention-suggestion-char="@" contenteditable="false">@Madonna</span>',
      )
      expect(await page.locator('.tiptap').first().innerHTML()).toContain(
        '<span class="mention" data-type="mention" data-id="Dirty Dancing" data-mention-suggestion-char="#" contenteditable="false">#Dirty Dancing</span>',
      )
    })

    test('should allow switching between mention types', async ({ page }) => {
      await page.locator('.tiptap').first().click()
      await typeText(page, '{selectall}{backspace}@')
      await expect(page.locator('.dropdown-menu').first()).toBeAttached()
      await expect(
        page.locator('.dropdown-menu button:nth-child(1)').filter({ hasText: 'Lea Thompson' }).first(),
      ).toBeAttached()

      // Close the dropdown by moving cursor
      await page.locator('.tiptap').first().click()
      await typeText(page, '{moveToStart}')
      await expect(page.locator('.dropdown-menu')).toHaveCount(0)

      // Open a new dropdown with #
      await page.locator('.tiptap').first().click()
      await typeText(page, '{selectall}{backspace}#')
      await expect(page.locator('.dropdown-menu').first()).toBeAttached()
      await expect(
        page.locator('.dropdown-menu button:nth-child(1)').filter({ hasText: 'Dirty Dancing' }).first(),
      ).toBeAttached()
    })

    test('should insert both types of mentions in sequence', async ({ page }) => {
      await page.locator('.tiptap').first().click()
      await typeText(page, '{selectall}{backspace}@mado{enter} likes #the{enter}')

      expect(await page.locator('.tiptap').first().innerHTML()).toContain(
        '<span class="mention" data-type="mention" data-id="Madonna" data-mention-suggestion-char="@" contenteditable="false">@Madonna</span> likes <span class="mention" data-type="mention" data-id="The Matrix" data-mention-suggestion-char="#" contenteditable="false">#The Matrix</span>',
      )
    })
  })
})
