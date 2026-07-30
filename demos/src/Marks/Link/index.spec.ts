import { expect, test } from '@playwright/test'

import { getEditor, setEditorContent } from '../../../test/helpers.js'

const demoName = 'Link'
const frameworkPaths = ['React', 'Vue']
const demoPath = '/src/Marks'

async function paste(
  editor: ReturnType<typeof getEditor> extends Promise<infer T> ? T : never,
  payload: string,
) {
  await editor.evaluate((el: HTMLElement, text: string) => {
    const dt = new DataTransfer()
    dt.setData('text/plain', text)
    el.dispatchEvent(
      new ClipboardEvent('paste', { clipboardData: dt, bubbles: true, cancelable: true }),
    )
  }, payload)
}

test.describe(`${demoPath}/${demoName}`, () => {
  frameworkPaths.forEach(frameworkPath => {
    const fullDemoPath = `${demoPath}/${demoName}/${frameworkPath}/`

    test.describe(`${frameworkPath}`, () => {
      test.beforeEach(async ({ page }) => {
        await page.addInitScript(() => {
          ;(window as any).prompt = () => 'https://tiptap.dev'
        })
        await page.goto(fullDemoPath)
        await setEditorContent(page, '<p>Example TextDEFAULT</p>')
        const editor = await getEditor(page)
        await editor.evaluate((el: any) => el.editor.commands.selectAll())
      })

      test('parses a tags correctly', async ({ page }) => {
        const editor = await getEditor(page)
        const html = await editor.evaluate((el: any) => {
          el.editor.commands.setContent('<p><a href="https://example.com">Example Text1</a></p>')
          return el.editor.getHTML()
        })
        expect(html).toBe(
          '<p><a target="_blank" rel="noopener noreferrer nofollow" href="https://example.com">Example Text1</a></p>',
        )
      })

      test('parses a tags with target attribute', async ({ page }) => {
        const editor = await getEditor(page)
        const html = await editor.evaluate((el: any) => {
          el.editor.commands.setContent(
            '<p><a href="https://example.com" target="_self">Example Text2</a></p>',
          )
          return el.editor.getHTML()
        })
        expect(html).toBe(
          '<p><a target="_self" rel="noopener noreferrer nofollow" href="https://example.com">Example Text2</a></p>',
        )
      })

      test('parses a tags with rel attribute', async ({ page }) => {
        const editor = await getEditor(page)
        const html = await editor.evaluate((el: any) => {
          el.editor.commands.setContent(
            '<p><a href="https://example.com" rel="follow">Example Text3</a></p>',
          )
          return el.editor.getHTML()
        })
        expect(html).toBe(
          '<p><a target="_blank" rel="follow" href="https://example.com">Example Text3</a></p>',
        )
      })

      test('button adds a link to selected text', async ({ page }) => {
        await page.locator('button').first().click()
        await expect(page.locator('.tiptap a')).toContainText('Example TextDEFAULT')
        await expect(page.locator('.tiptap a')).toHaveAttribute('href', 'https://tiptap.dev')
      })

      test('detects autolinking', async ({ page }) => {
        const editor = await getEditor(page)
        await editor.evaluate((el: any) => el.editor.commands.clearContent())
        await editor.click()
        await page.keyboard.type('https://example.com ')
        await expect(page.locator('.tiptap a')).toHaveAttribute('href', 'https://example.com')
      })

      test('detects autolinking with numbers', async ({ page }) => {
        const editor = await getEditor(page)
        await editor.evaluate((el: any) => el.editor.commands.clearContent())
        await editor.click()
        await page.keyboard.type('https://tiptap4u.com ')
        await expect(page.locator('.tiptap a')).toHaveAttribute('href', 'https://tiptap4u.com')
      })

      test('uses the default protocol', async ({ page }) => {
        const editor = await getEditor(page)
        await editor.evaluate((el: any) => el.editor.commands.clearContent())
        await editor.click()
        await page.keyboard.type('example.com ')
        await expect(page.locator('.tiptap a')).toHaveAttribute('href', 'https://example.com')
      })

      test('uses a non-default protocol if present', async ({ page }) => {
        const editor = await getEditor(page)
        await editor.evaluate((el: any) => el.editor.commands.clearContent())
        await editor.click()
        await page.keyboard.type('http://example.com ')
        await expect(page.locator('.tiptap a')).toHaveAttribute('href', 'http://example.com')
      })

      test('detects a pasted URL within text', async ({ page }) => {
        const editor = await getEditor(page)
        await editor.evaluate((el: any) => el.editor.commands.clearContent())
        await editor.click()
        await paste(editor, 'some text https://example1.com around an url')
        await expect(page.locator('.tiptap a')).toHaveAttribute('href', 'https://example1.com')
      })

      test('detects a pasted URL with query params', async ({ page }) => {
        const editor = await getEditor(page)
        await editor.evaluate((el: any) => el.editor.commands.clearContent())
        await editor.click()
        await paste(editor, 'https://example.com?paramA=nice&paramB=cool')
        await expect(page.locator('.tiptap a')).toHaveAttribute(
          'href',
          'https://example.com?paramA=nice&paramB=cool',
        )
      })

      test('converts typed Markdown link syntax into a link', async ({ page }) => {
        const editor = await getEditor(page)
        await editor.evaluate((el: any) => el.editor.commands.clearContent())
        await editor.click()
        await page.keyboard.type('[Tiptap](https://example.com)')
        await expect(page.locator('.tiptap a')).toContainText('Tiptap')
        await expect(page.locator('.tiptap a')).toHaveAttribute('href', 'https://example.com')
        await expect(page.locator('.tiptap')).not.toContainText('[')
      })

      test('converts typed Markdown link syntax with a title into a link', async ({ page }) => {
        const editor = await getEditor(page)
        await editor.evaluate((el: any) => el.editor.commands.clearContent())
        await editor.click()
        await page.keyboard.type('[Tiptap](https://example.com "Rich text editor")')
        await expect(page.locator('.tiptap a')).toContainText('Tiptap')
        await expect(page.locator('.tiptap a')).toHaveAttribute('href', 'https://example.com')
        await expect(page.locator('.tiptap a')).toHaveAttribute('title', 'Rich text editor')
      })

      test('converts a pasted Markdown link within text', async ({ page }) => {
        const editor = await getEditor(page)
        await editor.evaluate((el: any) => el.editor.commands.clearContent())
        await editor.click()
        await paste(editor, 'Check out [Tiptap](https://example.com) today')
        await expect(page.locator('.tiptap a')).toContainText('Tiptap')
        await expect(page.locator('.tiptap a')).toHaveAttribute('href', 'https://example.com')
        await expect(page.locator('.tiptap')).toContainText('Check out Tiptap today')
      })

      if (frameworkPath === 'React') {
        test('disallows links with disallowed protocols', async ({ page }) => {
          const editor = await getEditor(page)
          const disallowed = ['ftp://example.com', 'file:///example.txt', 'mailto:test@example.com']
          const htmls = await editor.evaluate((el: any, urls: string[]) => {
            return urls.map(url => {
              el.editor.commands.setContent(`<p><a href="${url}">Example Text</a></p>`)
              return el.editor.getHTML()
            })
          }, disallowed)
          htmls.forEach((html, i) => {
            expect(html).not.toContain(disallowed[i])
          })
        })

        test('does not auto-link a URL from a disallowed domain', async ({ page }) => {
          const editor = await getEditor(page)
          await editor.evaluate((el: any) => el.editor.commands.clearContent())
          await editor.click()
          await page.keyboard.type('https://example-phishing.com ')
          await expect(page.locator('.tiptap a')).toHaveCount(0)
          await expect(page.locator('.tiptap')).toContainText('https://example-phishing.com')
        })
      }
    })
  })
})
