import { expect, test } from '@playwright/test'

import { getEditor } from '../../../test/helpers.js'

const demoName = 'CollaborationCaret'
const frameworkPaths = ['React', 'Vue']
const demoPath = '/src/Extensions'

test.describe(`${demoPath}/${demoName}`, () => {
  frameworkPaths.forEach(frameworkPath => {
    const fullDemoPath = `${demoPath}/${demoName}/${frameworkPath}/`

    test.describe(`${frameworkPath}`, () => {
      test.beforeEach(async ({ page }) => {
        await page.goto(fullDemoPath)
      })

      test('has a working tiptap instance', async ({ page }) => {
        const editor = await getEditor(page)
        const isEditor = await editor.evaluate((el: any) => !!el.editor)
        expect(isEditor).toBe(true)
      })

      test('has a ydoc', async ({ page }) => {
        const editor = await getEditor(page)
        const hasYDoc = await editor.evaluate((el: any) => {
          const ext = el.editor.extensionManager.extensions.find((a: any) => a.name === 'collaboration')
          return !!ext?.options?.document
        })
        expect(hasYDoc).toBe(true)
      })
    })
  })
})
