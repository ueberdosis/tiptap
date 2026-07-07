import { expect, test } from '@playwright/test'

import { getEditor } from '../../../test/helpers.js'

const demoName = 'ReactComponentContentExperimental'
const demoPath = '/src/GuideNodeViews'
const fullDemoPath = `${demoPath}/${demoName}/React/`

test.describe(`${demoPath}/${demoName}`, () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(fullDemoPath)
    await getEditor(page)
  })

  test('renders the content node view without wrapper DOM', async ({ page }) => {
    await expect(page.locator('.tiptap > .react-component')).toHaveCount(1)
    await expect(page.locator('.tiptap [data-node-view-wrapper]')).toHaveCount(0)
    await expect(page.locator('.tiptap [data-node-view-content]')).toHaveCount(0)
    await expect(page.locator('.tiptap .react-component .content')).toContainText(
      'This is editable',
    )
  })

  test('edits inside the node view content', async ({ page }) => {
    const content = page.locator('.tiptap .react-component .content')

    await content.click()
    await page.keyboard.press('ControlOrMeta+a')

    // Select-all inside inline content selects the whole doc; narrow to the
    // node view content by placing the cursor there explicitly
    await page.evaluate(() => {
      const text = document.querySelector('.tiptap .react-component .content')?.firstChild as Text

      window.getSelection()?.setBaseAndExtent(text, 0, text, text.length)
    })
    await page.keyboard.type('rewritten')

    await expect(content).toHaveText('rewritten')
    // Surrounding paragraphs stay untouched
    await expect(page.locator('.tiptap > p').first()).toContainText('experimental React renderer')
  })

  test('keeps the component element while editing its content', async ({ page }) => {
    const identity = await page.evaluate(() => {
      const element = document.querySelector('.tiptap .react-component') as HTMLElement & {
        __probe?: number
      }

      element.__probe = 42
      const text = document.querySelector('.tiptap .react-component .content')?.firstChild as Text

      window.getSelection()?.collapse(text, 0)
      return element.__probe
    })

    expect(identity).toBe(42)

    await page.locator('.tiptap .react-component .content').click()
    await page.keyboard.type('x')

    const probeAfter = await page.evaluate(() => {
      const element = document.querySelector('.tiptap .react-component') as HTMLElement & {
        __probe?: number
      }

      return element.__probe
    })

    expect(probeAfter).toBe(42)
  })

  test('inserts a new component with Mod+Enter', async ({ page }) => {
    await page.locator('.tiptap > p').first().click()
    await page.keyboard.press('ControlOrMeta+Enter')

    await expect(page.locator('.tiptap .react-component')).toHaveCount(2)
  })
})
