import { expect, test } from '@playwright/test'

import { getEditor } from '../../../test/helpers.js'

const demoName = 'InteractivityComponentProvideInject'
const frameworkPaths = ['Vue']
const demoPath = '/src/Examples'

test.describe(`${demoPath}/${demoName}`, () => {
  frameworkPaths.forEach(frameworkPath => {
    const fullDemoPath = `${demoPath}/${demoName}/${frameworkPath}/`

    test.describe(`${frameworkPath}`, () => {
      test.beforeEach(async ({ page }) => {
        await page.goto(fullDemoPath)
      })

      test('should have a working tiptap instance', async ({ page }) => {
        const editor = await getEditor(page)
        const hasEditor = await editor.evaluate((el: any) => !!el.editor)

        expect(hasEditor).toBe(true)
      })

      test('should render a custom node', async ({ page }) => {
        await getEditor(page)
        await expect(page.locator('.tiptap .vue-component')).toHaveCount(1)
      })

      test('should have global and all injected values', async ({ page }) => {
        await getEditor(page)
        const expectedTexts = ['globalValue', 'appValue', 'indexValue', 'editorValue']
        const paragraphs = page.locator('.tiptap .vue-component p')

        await expectedTexts.reduce<Promise<void>>(
          (previousPromise, text, i) =>
            previousPromise.then(async () => {
              await expect(paragraphs.nth(i)).toHaveText(text)
            }),
          Promise.resolve(),
        )
      })
    })
  })
})
