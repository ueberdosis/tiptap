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

test.describe('/src/Nodes/Youtube/React/', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/src/Nodes/Youtube/React/')
  })

  test.beforeEach(async ({ page }) => {
    await page.locator('.tiptap').first().click()
    await typeText(page, '{selectall}{backspace}')
  })

  test('adds a video', async ({ page }) => {
    await page.evaluate(v => {
      ;(window as any).prompt = () => v
    }, 'https://music.youtube.com/watch?v=hBp4dgE7Bho&feature=share')
    await page.locator('#add').nth(0).click()
    await expect(page.locator('.tiptap div[data-youtube-video] iframe')).toHaveCount(1)
    /* invoke('attr') value */ await page.locator('.tiptap div[data-youtube-video] iframe').first().getAttribute('src')
    // TODO(playwright-migration): .then() chain on locator
  })

  test('adds a video with 320 width and 240 height', async ({ page }) => {
    await page.evaluate(v => {
      ;(window as any).prompt = () => v
    }, 'https://music.youtube.com/watch?v=hBp4dgE7Bho&feature=share')
    await page.locator('#width').first().click()
    await typeText(page, '{selectall}{backspace}320')
    await page.locator('#height').first().click()
    await typeText(page, '{selectall}{backspace}240')
    await page.locator('#add').nth(0).click()
    await expect(page.locator('.tiptap div[data-youtube-video] iframe')).toHaveCount(1)
    await expect(page.locator('.tiptap div[data-youtube-video] iframe').first()).toHaveCSS('width', '320px')
    await expect(page.locator('.tiptap div[data-youtube-video] iframe').first()).toHaveCSS('height', '240px')
    /* invoke('attr') value */ await page.locator('.tiptap div[data-youtube-video] iframe').first().getAttribute('src')
    // TODO(playwright-migration): .then() chain on locator
  })

  test('replaces a video', async ({ page }) => {
    const promptStub = /* TODO(playwright-migration): cy.stub(win, 'prompt')
     */ promptStub.onFirstCall().returns('https://music.youtube.com/watch?v=hBp4dgE7Bho&feature=share')
    promptStub.onSecondCall().returns('https://music.youtube.com/watch?v=wRakoMYVHm8')

    await page.locator('#add').nth(0).click()
    await expect(page.locator('.tiptap div[data-youtube-video] iframe')).toHaveCount(1)
    /* invoke('attr') value */ await page.locator('.tiptap div[data-youtube-video] iframe').first().getAttribute('src')
    // TODO(playwright-migration): .then() chain on locator

    await page.locator('.tiptap div[data-youtube-video] iframe').first().click()

    await page.locator('#add').nth(0).click()

    await expect(page.locator('.tiptap div[data-youtube-video] iframe')).toHaveCount(1)
    /* invoke('attr') value */ await page.locator('.tiptap div[data-youtube-video] iframe').first().getAttribute('src')
    // TODO(playwright-migration): .then() chain on locator
  })
})
