import { expect, test } from '@playwright/test'

import { getEditor } from '../../../test/helpers.js'

const demoName = 'AutolinkValidation'
const frameworkPaths = ['React', 'Vue']
const demoPath = '/src/Examples'

const validLinks: [string, string][] = [
  ['https://tiptap.dev ', 'https://tiptap.dev'],
  ['http://tiptap.dev ', 'http://tiptap.dev'],
  ['https://www.tiptap.dev/ ', 'https://www.tiptap.dev/'],
  ['http://www.tiptap.dev/ ', 'http://www.tiptap.dev/'],
  ['[http://www.example.com/] ', 'http://www.example.com/'],
  ['(http://www.example.com/) ', 'http://www.example.com/'],
]

const invalidLinks = ['tiptap.dev', 'www.tiptap.dev', 'https://tiptap.dev']

test.describe(`${demoPath}/${demoName}`, () => {
  frameworkPaths.forEach(frameworkPath => {
    const fullDemoPath = `${demoPath}/${demoName}/${frameworkPath}/`

    test.describe(`${frameworkPath}`, () => {
      test.beforeEach(async ({ page }) => {
        await page.goto(fullDemoPath)
        const editor = await getEditor(page)

        await editor.evaluate((el: any) => {
          el.editor.commands.clearContent()
        })
      })

      validLinks.forEach(([rawTextInput, textThatShouldBeLinked]) => {
        test(`should autolink ${rawTextInput}`, async ({ page }) => {
          const editor = await getEditor(page)

          await editor.click()
          await editor.type(rawTextInput)

          await expect(page.locator('.tiptap a').first()).toContainText(textThatShouldBeLinked)
        })
      })

      invalidLinks.forEach(rawTextInput => {
        test(`should not autolink ${rawTextInput}`, async ({ page }) => {
          const editor = await getEditor(page)

          await editor.click()
          await editor.type(rawTextInput)

          await expect(page.locator('.tiptap a')).toHaveCount(0)
        })
      })

      if (frameworkPath === 'React') {
        test('should not relink unset links after entering second link', async ({ page }) => {
          const editor = await getEditor(page)

          await editor.click()
          await editor.type('https://tiptap.dev ')
          await editor.press('Home')

          await expect(page.locator('.tiptap')).toHaveText('https://tiptap.dev ')

          await page.locator('[data-testid=unsetLink]').click()
          await expect(page.locator('.tiptap a')).toHaveCount(0)

          await editor.press('End')
          await editor.type('http://www.example.com/ ')

          await expect(page.locator('.tiptap a')).toHaveCount(1)
          await expect(page.locator('.tiptap a').first()).toHaveAttribute('href', 'http://www.example.com/')
        })

        test('should not relink unset links after hitting next paragraph', async ({ page }) => {
          const editor = await getEditor(page)

          await editor.click()
          await editor.type('https://tiptap.dev ')
          await editor.press('Home')
          await expect(page.locator('.tiptap')).toHaveText('https://tiptap.dev ')

          await page.locator('[data-testid=unsetLink]').click()
          await expect(page.locator('.tiptap a')).toHaveCount(0)

          await editor.press('End')
          await editor.type('typing other text should prevent the link from relinking when hitting enter')
          await editor.press('Enter')

          await expect(page.locator('.tiptap a')).toHaveCount(0)
        })

        test('should not relink unset links after modifying', async ({ page }) => {
          const editor = await getEditor(page)

          await editor.click()
          await editor.type('https://tiptap.dev ')
          await editor.press('Home')
          await expect(page.locator('.tiptap')).toHaveText('https://tiptap.dev ')

          await page.locator('[data-testid=unsetLink]').click()
          await expect(page.locator('.tiptap a')).toHaveCount(0)

          await editor.press('Home')
          await Array.from({ length: 'https://'.length }).reduce<Promise<void>>(
            previousPromise => previousPromise.then(() => editor.press('ArrowRight')),
            Promise.resolve(),
          )
          await editor.type('blah')

          await expect(page.locator('.tiptap')).toHaveText('https://blahtiptap.dev ')
          await expect(page.locator('.tiptap a')).toHaveCount(0)
        })

        test('should autolink after hitting enter (new paragraph)', async ({ page }) => {
          const editor = await getEditor(page)

          await editor.click()
          await editor.type('https://tiptap.dev')
          await editor.press('Enter')

          await expect(page.locator('.tiptap a')).toHaveCount(1)
          await expect(page.locator('.tiptap a').first()).toHaveAttribute('href', 'https://tiptap.dev')
        })

        test('should autolink after hitting shift-enter (hardbreak)', async ({ page }) => {
          const editor = await getEditor(page)

          await editor.click()
          await editor.type('https://tiptap.dev')
          await editor.press('Shift+Enter')

          await expect(page.locator('.tiptap a')).toHaveCount(1)
          await expect(page.locator('.tiptap a').first()).toHaveAttribute('href', 'https://tiptap.dev')
        })
      }
    })
  })
})
