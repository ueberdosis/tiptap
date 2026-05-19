import { expect, test } from '@playwright/test'

import { clickButton, getEditor } from '../../../test/helpers.js'

const demoName = 'TextDirection'
const frameworkPaths = ['React']
const demoPath = '/src/Examples'

test.describe(`${demoPath}/${demoName}`, () => {
  frameworkPaths.forEach(frameworkPath => {
    const fullDemoPath = `${demoPath}/${demoName}/${frameworkPath}/`

    test.describe(`${frameworkPath}`, () => {
      test.beforeEach(async ({ page }) => {
        await page.goto(fullDemoPath)
        await getEditor(page)
      })

      test('should apply text direction attributes', async ({ page }) => {
        await expect(page.locator('.tiptap p').first()).toHaveAttribute('dir', 'auto')
      })

      test('should change global direction', async ({ page }) => {
        await page.getByRole('button', { name: 'RTL', exact: true }).click()
        await expect(page.locator('.tiptap p').first()).toHaveAttribute('dir', 'rtl')
      })

      test('should set direction on selection', async ({ page }) => {
        await page.locator('.tiptap p').first().click()
        await clickButton(page, 'Set LTR')
        await expect(page.locator('.tiptap p').first()).toHaveAttribute('dir', 'ltr')
      })

      test('should unset direction', async ({ page }) => {
        await clickButton(page, 'None')
        await expect(page.locator('.tiptap p').first()).not.toHaveAttribute('dir', /.*/)
      })
    })
  })
})
