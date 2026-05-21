import { expect, test } from '@playwright/test'

import { getEditor } from '../../../test/helpers.js'

const demoName = 'MultiMention'
const frameworkPaths = ['React']
const demoPath = '/src/Examples'

async function clearEditor(page: any) {
  const editor = await getEditor(page)

  await editor.evaluate((el: any) => {
    el.editor.chain().focus().clearContent().run()
  })
  await editor.click()
}

test.describe(`${demoPath}/${demoName}`, () => {
  frameworkPaths.forEach(frameworkPath => {
    const fullDemoPath = `${demoPath}/${demoName}/${frameworkPath}/`

    test.describe(`${frameworkPath}`, () => {
      test.beforeEach(async ({ page }) => {
        await page.goto(fullDemoPath)
      })

      test.describe('Person mentions (@)', () => {
        test('should insert a person mention', async ({ page }) => {
          const editor = await getEditor(page)

          await editor.evaluate((el: any) => {
            el.editor.commands.setContent(
              '<p><span data-type="mention" data-id="Lea Thompson">@Lea Thompson</span></p>',
            )
          })

          const html = await editor.evaluate((el: HTMLElement) => el.innerHTML)

          expect(html).toContain(
            '<span class="mention" data-type="mention" data-id="Lea Thompson" data-mention-suggestion-char="@" contenteditable="false">@Lea Thompson</span>',
          )
        })

        test("should open a dropdown menu when I type '@'", async ({ page }) => {
          await clearEditor(page)
          await page.locator('.tiptap').type('@')

          await expect(page.locator('.dropdown-menu')).toBeVisible()
        })

        test('should display the correct person options in the dropdown menu', async ({ page }) => {
          await clearEditor(page)
          await page.locator('.tiptap').type('@')

          const dropdown = page.locator('.dropdown-menu')
          await expect(dropdown).toBeVisible()
          await expect(dropdown.locator('button')).toHaveCount(5)

          const buttons = dropdown.locator('button')

          await expect(buttons.nth(0)).toContainText('Lea Thompson')
          await expect(buttons.nth(0)).toHaveClass(/is-selected/)
          await expect(buttons.nth(1)).toContainText('Cyndi Lauper')
          await expect(buttons.nth(2)).toContainText('Tom Cruise')
          await expect(buttons.nth(3)).toContainText('Madonna')
          await expect(buttons.nth(4)).toContainText('Jerry Hall')
        })

        test('should insert Cyndi Lauper mention when clicking on her option', async ({ page }) => {
          await clearEditor(page)
          await page.locator('.tiptap').type('@')

          await page.locator('.dropdown-menu button').nth(1).click()

          const html = await page
            .locator('.tiptap')
            .first()
            .evaluate((el: HTMLElement) => el.innerHTML)

          expect(html).toContain(
            '<span class="mention" data-type="mention" data-id="Cyndi Lauper" data-mention-suggestion-char="@" contenteditable="false">@Cyndi Lauper</span>',
          )
        })

        test('should close the dropdown menu when I move the cursor outside the editor', async ({ page }) => {
          await clearEditor(page)
          await page.locator('.tiptap').type('@')
          await expect(page.locator('.dropdown-menu')).toBeVisible()

          await page.locator('.tiptap').press('Home')
          await expect(page.locator('.dropdown-menu')).toHaveCount(0)
        })

        test('should close the dropdown menu when I press the escape key', async ({ page }) => {
          await clearEditor(page)
          await page.locator('.tiptap').type('@')
          await expect(page.locator('.dropdown-menu')).toBeVisible()

          await page.locator('.tiptap').press('Escape')
          await expect(page.locator('.dropdown-menu')).toHaveCount(0)
        })

        test('should insert Tom Cruise when selecting his option with the arrow keys and pressing enter', async ({
          page,
        }) => {
          await clearEditor(page)
          await page.locator('.tiptap').type('@')
          await expect(page.locator('.dropdown-menu')).toBeVisible()

          await page.locator('.tiptap').press('ArrowDown')
          await page.locator('.tiptap').press('ArrowDown')

          await expect(page.locator('.dropdown-menu button').nth(2)).toHaveClass(/is-selected/)
          await page.locator('.tiptap').press('Enter')

          const html = await page
            .locator('.tiptap')
            .first()
            .evaluate((el: HTMLElement) => el.innerHTML)

          expect(html).toContain(
            '<span class="mention" data-type="mention" data-id="Tom Cruise" data-mention-suggestion-char="@" contenteditable="false">@Tom Cruise</span>',
          )
        })

        test('should show "No result" when searching for a non-existent person', async ({ page }) => {
          await clearEditor(page)
          await page.locator('.tiptap').type('@nonexistent')

          await expect(page.locator('.dropdown-menu')).toContainText('No result')
        })

        test('should only show the Madonna option when I type "@mado"', async ({ page }) => {
          await clearEditor(page)
          await page.locator('.tiptap').type('@mado')

          await expect(page.locator('.dropdown-menu button')).toHaveCount(1)
          await expect(page.locator('.dropdown-menu button').first()).toContainText('Madonna')
        })

        test('should insert Madonna when I type "@mado" and hit enter', async ({ page }) => {
          await clearEditor(page)
          await page.locator('.tiptap').type('@mado')
          await page.locator('.tiptap').press('Enter')

          const html = await page
            .locator('.tiptap')
            .first()
            .evaluate((el: HTMLElement) => el.innerHTML)

          expect(html).toContain(
            '<span class="mention" data-type="mention" data-id="Madonna" data-mention-suggestion-char="@" contenteditable="false">@Madonna</span>',
          )
        })
      })

      test.describe('Movie mentions (#)', () => {
        test('should insert a movie mention', async ({ page }) => {
          const editor = await getEditor(page)

          await editor.evaluate((el: any) => {
            el.editor.commands.setContent(
              '<p><span data-type="mention" data-id="The Matrix" data-mention-suggestion-char="#">#The Matrix</span></p>',
            )
          })

          const html = await editor.evaluate((el: HTMLElement) => el.innerHTML)

          expect(html).toContain(
            '<span class="mention" data-type="mention" data-id="The Matrix" data-mention-suggestion-char="#" contenteditable="false">#The Matrix</span>',
          )
        })

        test("should open a dropdown menu when I type '#'", async ({ page }) => {
          await clearEditor(page)
          await page.locator('.tiptap').type('#')

          await expect(page.locator('.dropdown-menu')).toBeVisible()
        })

        test('should display the correct movie options in the dropdown menu', async ({ page }) => {
          await clearEditor(page)
          await page.locator('.tiptap').type('#')

          const dropdown = page.locator('.dropdown-menu')
          await expect(dropdown).toBeVisible()
          await expect(dropdown.locator('button')).toHaveCount(3)

          const buttons = dropdown.locator('button')

          await expect(buttons.nth(0)).toContainText('Dirty Dancing')
          await expect(buttons.nth(0)).toHaveClass(/is-selected/)
          await expect(buttons.nth(1)).toContainText('Pirates of the Caribbean')
          await expect(buttons.nth(2)).toContainText('The Matrix')
        })

        test('should insert Pirates of the Caribbean when clicking on its option', async ({ page }) => {
          await clearEditor(page)
          await page.locator('.tiptap').type('#')

          await page.locator('.dropdown-menu button').nth(1).click()

          const html = await page
            .locator('.tiptap')
            .first()
            .evaluate((el: HTMLElement) => el.innerHTML)

          expect(html).toContain(
            '<span class="mention" data-type="mention" data-id="Pirates of the Caribbean" data-mention-suggestion-char="#" contenteditable="false">#Pirates of the Caribbean</span>',
          )
        })

        test('should close the dropdown menu when I move the cursor outside the editor', async ({ page }) => {
          await clearEditor(page)
          await page.locator('.tiptap').type('#')
          await expect(page.locator('.dropdown-menu')).toBeVisible()

          await page.locator('.tiptap').press('Home')
          await expect(page.locator('.dropdown-menu')).toHaveCount(0)
        })

        test('should close the dropdown menu when I press the escape key', async ({ page }) => {
          await clearEditor(page)
          await page.locator('.tiptap').type('#')
          await expect(page.locator('.dropdown-menu')).toBeVisible()

          await page.locator('.tiptap').press('Escape')
          await expect(page.locator('.dropdown-menu')).toHaveCount(0)
        })

        test('should insert The Matrix via arrow keys and enter', async ({ page }) => {
          await clearEditor(page)
          await page.locator('.tiptap').type('#')
          await expect(page.locator('.dropdown-menu')).toBeVisible()

          await page.locator('.tiptap').press('ArrowDown')
          await page.locator('.tiptap').press('ArrowDown')

          await expect(page.locator('.dropdown-menu button').nth(2)).toHaveClass(/is-selected/)
          await page.locator('.tiptap').press('Enter')

          const html = await page
            .locator('.tiptap')
            .first()
            .evaluate((el: HTMLElement) => el.innerHTML)

          expect(html).toContain(
            '<span class="mention" data-type="mention" data-id="The Matrix" data-mention-suggestion-char="#" contenteditable="false">#The Matrix</span>',
          )
        })

        test('should show "No result" when searching for a non-existent movie', async ({ page }) => {
          await clearEditor(page)
          await page.locator('.tiptap').type('#nonexistent')

          await expect(page.locator('.dropdown-menu')).toContainText('No result')
        })

        test('should only show Dirty Dancing when typing "#dir"', async ({ page }) => {
          await clearEditor(page)
          await page.locator('.tiptap').type('#dir')

          await expect(page.locator('.dropdown-menu button')).toHaveCount(1)
          await expect(page.locator('.dropdown-menu button').first()).toContainText('Dirty Dancing')
        })

        test('should insert Dirty Dancing when typing "#dir" and hit enter', async ({ page }) => {
          await clearEditor(page)
          await page.locator('.tiptap').type('#dir')
          await page.locator('.tiptap').press('Enter')

          const html = await page
            .locator('.tiptap')
            .first()
            .evaluate((el: HTMLElement) => el.innerHTML)

          expect(html).toContain(
            '<span class="mention" data-type="mention" data-id="Dirty Dancing" data-mention-suggestion-char="#" contenteditable="false">#Dirty Dancing</span>',
          )
        })
      })

      test.describe('Interaction between mention types', () => {
        test('should support both mention types in the same document', async ({ page }) => {
          const editor = await getEditor(page)

          await editor.evaluate((el: any) => {
            el.editor.commands.setContent(
              '<p><span data-type="mention" data-id="Madonna">@Madonna</span> starred in <span data-type="mention" data-id="Dirty Dancing" data-mention-suggestion-char="#">#Dirty Dancing</span></p>',
            )
          })

          const html = await editor.evaluate((el: HTMLElement) => el.innerHTML)

          expect(html).toContain(
            '<span class="mention" data-type="mention" data-id="Madonna" data-mention-suggestion-char="@" contenteditable="false">@Madonna</span>',
          )
          expect(html).toContain(
            '<span class="mention" data-type="mention" data-id="Dirty Dancing" data-mention-suggestion-char="#" contenteditable="false">#Dirty Dancing</span>',
          )
        })

        test('should allow switching between mention types', async ({ page }) => {
          await clearEditor(page)
          await page.locator('.tiptap').type('@')
          await expect(page.locator('.dropdown-menu')).toBeVisible()
          await expect(page.locator('.dropdown-menu button').first()).toContainText('Lea Thompson')

          await page.locator('.tiptap').press('Home')
          await expect(page.locator('.dropdown-menu')).toHaveCount(0)

          await clearEditor(page)
          await page.locator('.tiptap').type('#')
          await expect(page.locator('.dropdown-menu')).toBeVisible()
          await expect(page.locator('.dropdown-menu button').first()).toContainText('Dirty Dancing')
        })

        test('should insert both types of mentions in sequence', async ({ page }) => {
          await clearEditor(page)
          await page.locator('.tiptap').type('@mado')
          await page.locator('.tiptap').press('Enter')
          await page.locator('.tiptap').type(' likes #the')
          await page.locator('.tiptap').press('Enter')

          const html = await page
            .locator('.tiptap')
            .first()
            .evaluate((el: HTMLElement) => el.innerHTML)

          expect(html).toContain('@Madonna')
          expect(html).toContain('#The Matrix')
        })
      })
    })
  })
})
