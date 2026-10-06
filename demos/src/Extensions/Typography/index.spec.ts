import { expect, test } from '@playwright/test'

import { getEditor } from '../../../test/helpers.js'

const demoName = 'Typography'
const frameworkPaths = ['React', 'Vue']
const demoPath = '/src/Extensions'

const cases: [string, string][] = [
  ['-- emDash', '— emDash'],
  ['... ellipsis', '… ellipsis'],
  ['"openDoubleQuote"', '“openDoubleQuote'],
  ['"closeDoubleQuote"', 'closeDoubleQuote”'],
  ["'openSingleQuote'", '‘openSingleQuote’'],
  ["'closeSingleQuote'", 'closeSingleQuote’'],
  ['<- leftArrow', '← leftArrow'],
  ['-> rightArrow', '→ rightArrow'],
  ['(c) copyright', '© copyright'],
  ['(r) registeredTrademark', '® registeredTrademark'],
  ['(tm) trademark', '™ trademark'],
  ['1/2 oneHalf', '½ oneHalf'],
  ['+/- plusMinus', '± plusMinus'],
  ['!= notEqual', '≠ notEqual'],
  ['<< laquorow', '« laquo'],
  ['>> raquorow', '» raquo'],
  ['1*1 multiplication', '1×1 multiplication'],
  ['1x1 multiplication', '1×1 multiplication'],
  ['1 * 1 multiplication', '1 × 1 multiplication'],
  ['1 x 1 multiplication', '1 × 1 multiplication'],
]

test.describe(`${demoPath}/${demoName}`, () => {
  frameworkPaths.forEach(frameworkPath => {
    const fullDemoPath = `${demoPath}/${demoName}/${frameworkPath}/`

    test.describe(`${frameworkPath}`, () => {
      test.beforeEach(async ({ page }) => {
        await page.goto(fullDemoPath)
        const editor = await getEditor(page)
        await editor.evaluate((el: any) => el.editor.commands.clearContent())
        await editor.click()
      })

      if (frameworkPath === 'React') {
        test('keeps dates as they are', async ({ page }) => {
          const editor = await getEditor(page)
          await editor.type('1/4/2024')
          await expect(editor).toContainText('1/4/2024')
        })

        test('makes a fraction only with spaces afterwards', async ({ page }) => {
          const editor = await getEditor(page)
          await editor.type('1/4')
          await expect(editor).toContainText('1/4')
          await editor.evaluate((el: any) => el.editor.commands.clearContent())
          await editor.click()
          await editor.type('1/4 ')
          await expect(editor).toContainText('¼')
        })
      }

      cases.forEach(([input, expected]) => {
        test(`transforms "${input}" to contain "${expected}"`, async ({ page }) => {
          const editor = await getEditor(page)
          await editor.type(input)
          await expect(editor).toContainText(expected)
        })
      })
    })
  })
})
