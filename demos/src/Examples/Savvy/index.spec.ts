import { expect, test } from '@playwright/test'

import { getEditor } from '../../../test/helpers.js'

const demoName = 'Savvy'
const frameworkPaths = ['React', 'Vue']
const demoPath = '/src/Examples'

const cases: [string, string][] = [
  ['(c)', '©'],
  ['->', '→'],
  ['>>', '»'],
  ['1/2', '½'],
  ['!=', '≠'],
  ['--', '—'],
  ['1x1', '1×1'],
  [':-) ', '🙂'],
  ['<3 ', '❤️'],
  ['>:P ', '😜'],
]

test.describe(`${demoPath}/${demoName}`, () => {
  frameworkPaths.forEach(frameworkPath => {
    const fullDemoPath = `${demoPath}/${demoName}/${frameworkPath}/`

    test.describe(`${frameworkPath}`, () => {
      test.beforeEach(async ({ page }) => {
        await page.goto(fullDemoPath)
        const editor = await getEditor(page)

        await editor.evaluate((el: any) => {
          el.editor.chain().focus().clearContent().run()
        })
      })

      cases.forEach(([input, expected]) => {
        test(`should parse ${input} correctly`, async ({ page }) => {
          const editor = await getEditor(page)

          await editor.click()
          await editor.type(`${input} `)

          await expect(page.locator('.tiptap')).toContainText(expected)
        })
      })

      test('should parse hex colors correctly', async ({ page }) => {
        const editor = await getEditor(page)

        await editor.click()
        await editor.type('#FD9170')

        await expect(page.locator('.tiptap .color').first()).toBeVisible()
      })
    })
  })
})
