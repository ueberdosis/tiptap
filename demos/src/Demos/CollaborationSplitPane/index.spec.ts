import { expect, test } from '@playwright/test'

const demoName = 'CollaborationSplitPane'
const frameworkPaths = ['React']
const demoPath = '/src/Demos'

test.describe(`${demoPath}/${demoName}`, () => {
  frameworkPaths.forEach(frameworkPath => {
    const fullDemoPath = `${demoPath}/${demoName}/${frameworkPath}/`

    test.describe(`${frameworkPath}`, () => {
      test.beforeEach(async ({ page }) => {
        await page.goto(fullDemoPath)
      })

      test('should have a working tiptap instance', async ({ page }) => {
        const editor = page.locator('.tiptap').first()
        await editor.waitFor()

        const hasEditor = await editor.evaluate((el: any) => !!el.editor)

        expect(hasEditor).toBe(true)
      })

      test('should have a ydoc', async ({ page }) => {
        const editor = page.locator('.tiptap').first()
        await editor.waitFor()

        const hasYDoc = await editor.evaluate((el: any) => {
          const extension = el.editor.extensionManager.extensions.find((a: any) => a.name === 'collaboration')

          return !!extension?.options.document
        })

        expect(hasYDoc).toBe(true)
      })
    })
  })
})
