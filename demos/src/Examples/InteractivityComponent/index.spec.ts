import { expect, test } from '@playwright/test'

import { getEditor } from '../../../test/helpers.js'

const demoName = 'InteractivityComponent'
const frameworkPaths = ['React', 'Vue']
const demoPath = '/src/Examples'

test.describe(`${demoPath}/${demoName}`, () => {
  frameworkPaths.forEach(frameworkPath => {
    const fullDemoPath = `${demoPath}/${demoName}/${frameworkPath}/`
    const componentClass = frameworkPath === 'React' ? '.react-component' : '.vue-component'

    test.describe(`${frameworkPath}`, () => {
      test.beforeEach(async ({ page }) => {
        await page.goto(fullDemoPath)
      })

      test('should render a custom node', async ({ page }) => {
        await getEditor(page)
        await expect(page.locator(`.tiptap ${componentClass}`)).toHaveCount(1)
      })

      test('should handle count click inside custom node', async ({ page }) => {
        await getEditor(page)
        const button = page.locator(`.tiptap ${componentClass} button`).first()

        await expect(button).toHaveText('This button has been clicked 0 times.')
        await button.click()
        await expect(button).toHaveText('This button has been clicked 1 times.')
        await button.click()
        await expect(button).toHaveText('This button has been clicked 2 times.')
        await button.click()
        await expect(button).toHaveText('This button has been clicked 3 times.')
      })
    })
  })
})
