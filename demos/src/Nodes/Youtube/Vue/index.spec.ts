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

test.describe('/src/Nodes/Youtube/Vue/', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/src/Nodes/Youtube/Vue/')
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
    {
      const src = await page.locator('.tiptap div[data-youtube-video] iframe').first().getAttribute('src')
      const url = new URL(src)

      expect(`${url.origin}${url.pathname}`).toBe('https://www.youtube-nocookie.com/embed/hBp4dgE7Bho')
      expect([...url.searchParams.keys()]).toEqual(expect.arrayContaining(['controls', 'rel']))
      expect(url.searchParams.get('controls')).toBe('0')
      expect(url.searchParams.get('rel')).toBe('1')
    }
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
    {
      const src = await page.locator('.tiptap div[data-youtube-video] iframe').first().getAttribute('src')
      const url = new URL(src)

      expect(`${url.origin}${url.pathname}`).toBe('https://www.youtube-nocookie.com/embed/hBp4dgE7Bho')
      expect([...url.searchParams.keys()]).toEqual(expect.arrayContaining(['controls', 'rel']))
      expect(url.searchParams.get('controls')).toBe('0')
      expect(url.searchParams.get('rel')).toBe('1')
    }
  })

  test('replaces a video', async ({ page }) => {
    await page.evaluate(
      values => {
        let __i = 0
        ;(window as any).prompt = () => values[__i++] ?? values[values.length - 1]
      },
      ['https://music.youtube.com/watch?v=hBp4dgE7Bho&feature=share', 'https://music.youtube.com/watch?v=wRakoMYVHm8'],
    )

    await page.locator('#add').nth(0).click()
    await expect(page.locator('.tiptap div[data-youtube-video] iframe')).toHaveCount(1)
    {
      const src = await page.locator('.tiptap div[data-youtube-video] iframe').first().getAttribute('src')
      const url = new URL(src)

      expect(`${url.origin}${url.pathname}`).toBe('https://www.youtube-nocookie.com/embed/hBp4dgE7Bho')
      expect([...url.searchParams.keys()]).toEqual(expect.arrayContaining(['controls', 'rel']))
      expect(url.searchParams.get('controls')).toBe('0')
      expect(url.searchParams.get('rel')).toBe('1')
    }

    await page.locator('.tiptap div[data-youtube-video] iframe').first().click()

    await page.locator('#add').nth(0).click()

    await expect(page.locator('.tiptap div[data-youtube-video] iframe')).toHaveCount(1)
    {
      const src = await page.locator('.tiptap div[data-youtube-video] iframe').first().getAttribute('src')
      const url = new URL(src)

      expect(`${url.origin}${url.pathname}`).toBe('https://www.youtube-nocookie.com/embed/wRakoMYVHm8')
      expect([...url.searchParams.keys()]).toEqual(expect.arrayContaining(['controls', 'rel']))
      expect(url.searchParams.get('controls')).toBe('0')
      expect(url.searchParams.get('rel')).toBe('1')
    }
  })
})
