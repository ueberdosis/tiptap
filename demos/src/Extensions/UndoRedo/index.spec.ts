import { expect, test } from '@playwright/test'

import { getEditor, setEditorContent } from '../../../test/helpers.js'

const demoName = 'UndoRedo'
const frameworkPaths = ['React', 'Vue']
const demoPath = '/src/Extensions'

const isMac = process.platform === 'darwin'
const mod = isMac ? 'Meta' : 'Control'

test.describe(`${demoPath}/${demoName}`, () => {
  frameworkPaths.forEach(frameworkPath => {
    const fullDemoPath = `${demoPath}/${demoName}/${frameworkPath}/`

    test.describe(`${frameworkPath}`, () => {
      test.beforeEach(async ({ page }) => {
        await page.goto(fullDemoPath)
        await setEditorContent(page, '<p>Mistake</p>')
      })

      test('undoes the last change via button', async ({ page }) => {
        const editor = await getEditor(page)
        await expect(editor).toContainText('Mistake')

        const undoBtn = page.locator('button').first()
        await expect(undoBtn).not.toHaveAttribute('disabled', '')
        await undoBtn.click()

        await expect(editor).not.toContainText('Mistake')
      })

      test('undoes the last change with the keyboard shortcut', async ({ page }) => {
        const editor = await getEditor(page)
        await editor.click()
        await page.keyboard.press(`${mod}+z`)
        await expect(editor).not.toContainText('Mistake')
      })

      test('redoes the last undone change with the keyboard shortcut', async ({ page }) => {
        const editor = await getEditor(page)
        await editor.click()
        await page.keyboard.press(`${mod}+z`)
        await expect(editor).not.toContainText('Mistake')

        await page.keyboard.press(`${mod}+Shift+z`)
        await expect(editor).toContainText('Mistake')
      })

      test('redoes the last undone change via buttons', async ({ page }) => {
        const editor = await getEditor(page)
        const undoBtn = page.locator('button').nth(0)
        const redoBtn = page.locator('button').nth(1)

        await expect(editor).toContainText('Mistake')
        await undoBtn.click()
        await expect(editor).not.toContainText('Mistake')
        await expect(undoBtn).toHaveAttribute('disabled', '')

        await redoBtn.click()
        await expect(editor).toContainText('Mistake')
      })

      test('disables undo button when there are no more changes to undo', async ({ page }) => {
        const undoBtn = page.locator('button').first()
        await expect(undoBtn).not.toHaveAttribute('disabled', '')
        await undoBtn.click()
        await expect(undoBtn).toHaveAttribute('disabled', '')
      })

      test('disables redo button when there are no more changes to redo', async ({ page }) => {
        const undoBtn = page.locator('button').nth(0)
        const redoBtn = page.locator('button').nth(1)

        await expect(redoBtn).toHaveAttribute('disabled', '')
        await expect(undoBtn).not.toHaveAttribute('disabled', '')
        await undoBtn.click()
        await expect(redoBtn).not.toHaveAttribute('disabled', '')
      })
    })
  })
})
