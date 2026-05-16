import {
  editorEval,
  expect,
  getEditorHTML,
  getEditorJSON,
  getEditorText,
  pasteIntoEditor,
  pressShortcut,
  setEditorContent,
  test,
  typeInEditor,
  typeText,
  waitForEditor,
  withEditor,
} from '../../../../../tests/e2e/support/index.js'

test.describe('/src/Demos/SingleRoomCollab/React/', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/src/Demos/SingleRoomCollab/React/')
  })

  /* test('should show the current room with participants', async ({ page }) => {
    await page.waitForTimeout(6000)
    await expect(page.locator('.editor__status')).toContainText('rooms.')
    await expect(page.locator('.editor__status')).toContainText('users online')
  })

  test('should allow user to change name', async ({ page }) => {
    
      await page.evaluate((v) => { (window as any).prompt = () => v }, 'John Doe')
      await page.locator('.editor__name > button').first().click()
      await page.waitForTimeout(6000)
      await expect(page.locator('.editor__name')).toContainText('John Doe')
    
  }) */
})
