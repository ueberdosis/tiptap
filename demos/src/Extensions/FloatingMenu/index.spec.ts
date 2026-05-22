import { expect, test } from '@playwright/test'

import { getEditor } from '../../../test/helpers.js'

const demoName = 'FloatingMenu'
const frameworkPaths = ['React']
const demoPath = '/src/Extensions'

test.describe(`${demoPath}/${demoName}`, () => {
  frameworkPaths.forEach(frameworkPath => {
    const fullDemoPath = `${demoPath}/${demoName}/${frameworkPath}/`

    test.describe(`${frameworkPath}`, () => {
      test.beforeEach(async ({ page }) => {
        await page.goto(fullDemoPath)
      })

      test('does not render a floating menu on non-empty nodes', async ({ page }) => {
        const editor = await getEditor(page)
        await editor.evaluate((el: any) => el.editor.chain().setContent('<p>Example Text</p>').focus().run())
        await expect(page.locator('[data-testid="floating-menu"]')).toHaveCount(0)
      })

      test('renders a floating menu on empty nodes', async ({ page }) => {
        const editor = await getEditor(page)
        await editor.evaluate((el: any) => el.editor.chain().setContent('<p></p>').focus().run())
        await expect(page.locator('[data-testid="floating-menu"]')).toBeVisible()
      })
    })
  })
})
