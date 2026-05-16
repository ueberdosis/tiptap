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

test.describe('/src/Experiments/CollaborationAnnotation/Vue/', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/src/Experiments/CollaborationAnnotation/Vue/')
  })

  /* test('renders two editors', async ({ page }) => {
    await expect(page.locator('.tiptap')).toHaveCount(2)
  }) */

  // TODO: Fix those tests in the future
  // Current problem is that tiptap seems to mismatch a transformation somewhere inside those tests
  // So to fix this, we should look for a different way to simulate the annotation process

  /* test('sets an annotation in editor 1 and shows annotations in both editors', async ({ page }) => {
    
      await page.evaluate((v) => { (window as any).prompt = () => v }, 'This is a test comment')
      await page.locator('.editor-1 .tiptap').first().click()
      await typeText(page, '{selectall}{backspace}Hello world{selectall}')
      await page.locator('button').filter({ hasText: 'Comment' }).nth(0).click()
      await page.locator('.editor-1 .tiptap').first().click()
      await typeText(page, '{end}')
      await expect(page.locator('.tiptap .annotation')).toHaveCount(2)
      await expect(page.locator('.comment').first()).toBeAttached()
    
  }) */

  /* test('updates an existing annotation', async ({ page }) => {
    let commentIndex = 0

    
      await page.evaluate((v) => { (window as any).prompt = () => v }, {
        switch (commentIndex) {
          case 0:
            commentIndex += 1
            return 'This is a test comment'

          case 1:
            commentIndex += 1
            return 'This is the new comment'

          default:
            return ''
        }
      })

      await page.locator('.editor-1 .tiptap').first().click()
      await typeText(page, '{selectall}{backspace}Hello world{selectall}')
      await page.locator('button').filter({ hasText: 'Comment' }).nth(0).click()
      await page.waitForTimeout(1000)
      await page.locator('.editor-1 .tiptap').locator('.annotation').first().click()
      await expect(page.locator('.comment').first()).toBeAttached()
      await page.locator('button').filter({ hasText: 'Update' }).first().click()
      await page.waitForTimeout(1000)
      await expect(page.locator('.comment').first()).toBeAttached()
    
  }) */

  /* test('deletes an existing annotation', async ({ page }) => {
    
      await page.evaluate((v) => { (window as any).prompt = () => v }, 'This is a test comment')

      await page.locator('.editor-1 .tiptap').first().click()
      await typeText(page, '{selectall}{backspace}Hello world{selectall}')
      await page.locator('button').filter({ hasText: 'Comment' }).nth(0).click()
      await page.waitForTimeout(1000)
      await page.locator('.editor-1 .tiptap').locator('.annotation').first().click()
      await expect(page.locator('.comment').first()).toBeAttached()
      await page.locator('button').filter({ hasText: 'Remove' }).first().click()
      await expect(page.locator('.tiptap .annotation')).toHaveCount(0)
      await page.waitForTimeout(1000)
      await expect(page.locator('.comment')).toHaveCount(0)
    
  }) */
})
