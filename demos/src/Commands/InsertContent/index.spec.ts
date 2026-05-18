import { expect, test } from '@playwright/test'

import { clickButton, getEditor } from '../../../test/helpers.js'

const demoName = 'InsertContent'
const frameworkPaths = ['React']
const demoPath = '/src/Commands'

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

      test('should insert html content correctly', async ({ page }) => {
        await clickButton(page, 'Insert HTML content')

        const html = await (await getEditor(page)).evaluate((el: HTMLElement) => el.innerHTML)

        expect(html).toContain(
          '<h1><a target="_blank" rel="noopener noreferrer nofollow" href="https://tiptap.dev/">Tiptap</a></h1><p><strong>Hello World</strong></p><p>This is a paragraph<br>with a break.</p><p>And this is some additional string content.</p>',
        )
      })

      test('should keep spaces inbetween tags in html content', async ({ page }) => {
        const editor = await getEditor(page)

        await editor.evaluate((el: any) => {
          el.editor.commands.insertContent('<p><b>Hello</b> <i>World</i></p>')
        })

        const html = await editor.evaluate((el: HTMLElement) => el.innerHTML)

        expect(html).toContain('<p><strong>Hello</strong> <em>World</em></p>')
      })

      test('should keep empty spaces', async ({ page }) => {
        const editor = await getEditor(page)

        await editor.evaluate((el: any) => {
          el.editor.commands.insertContent('  ')
        })

        const html = await editor.evaluate((el: HTMLElement) => el.innerHTML)

        expect(html).toContain('<p>  </p>')
      })

      test('should insert text content correctly', async ({ page }) => {
        await clickButton(page, 'Insert text content')

        const html = await (await getEditor(page)).evaluate((el: HTMLElement) => el.innerHTML)

        expect(html).toContain(
          'Hello World\nThis is content with a new line. Is this working?\n\nLets see if multiple new lines are inserted correctly',
        )
      })

      test('should keep newlines in pre tag', async ({ page }) => {
        const editor = await getEditor(page)

        await editor.evaluate((el: any) => {
          el.editor.commands.insertContent('<pre><code>foo\nbar</code></pre>')
        })

        const html = await editor.evaluate((el: HTMLElement) => el.innerHTML)

        expect(html).toContain('<pre><code>foo\nbar</code></pre>')
      })

      test('should keep newlines and tabs', async ({ page }) => {
        const editor = await getEditor(page)

        await editor.evaluate((el: any) => {
          el.editor.commands.insertContent('<p>Hello\n\tworld\n\t\thow\n\t\t\tnice.\ntest\tOK</p>')
        })

        const html = await editor.evaluate((el: HTMLElement) => el.innerHTML)

        expect(html).toContain('<p>Hello\n\tworld\n\t\thow\n\t\t\tnice.\ntest\tOK</p>')
      })

      test('should keep newlines and tabs between html fragments', async ({ page }) => {
        const editor = await getEditor(page)

        await editor.evaluate((el: any) => {
          el.editor.commands.insertContent('<h1>Tiptap</h1>\n<p><strong>Hello World</strong></p>')
        })

        const html = await editor.evaluate((el: HTMLElement) => el.innerHTML)

        expect(html).toContain('<h1>Tiptap</h1><p><strong>Hello World</strong></p>')
      })

      test('should allow inserting nothing', async ({ page }) => {
        const editor = await getEditor(page)

        await editor.evaluate((el: any) => {
          el.editor.commands.insertContent('')
        })

        const html = await editor.evaluate((el: HTMLElement) => el.innerHTML)

        expect(html).toBeDefined()
      })

      test('should allow inserting a partial HTML tag', async ({ page }) => {
        const editor = await getEditor(page)

        await editor.evaluate((el: any) => {
          el.editor.commands.insertContent('<p>foo')
        })

        const html = await editor.evaluate((el: HTMLElement) => el.innerHTML)

        expect(html).toContain('<p>foo</p>')
      })

      test('should allow inserting an incomplete HTML tag', async ({ page }) => {
        const editor = await getEditor(page)

        await editor.evaluate((el: any) => {
          el.editor.commands.insertContent('foo<p')
        })

        const html = await editor.evaluate((el: HTMLElement) => el.innerHTML)

        expect(html).toContain('<p>foo&lt;p</p>')
      })

      test('should allow inserting a list', async ({ page }) => {
        const editor = await getEditor(page)

        await editor.evaluate((el: any) => {
          el.editor.commands.insertContent('<ul><li>ABC</li><li>123</li></ul>')
        })

        const html = await editor.evaluate((el: HTMLElement) => el.innerHTML)

        expect(html).toContain('<ul><li><p>ABC</p></li><li><p>123</p></li></ul>')
      })

      test('should remove newlines and tabs when parseOptions.preserveWhitespace=false', async ({ page }) => {
        const editor = await getEditor(page)

        await editor.evaluate((el: any) => {
          el.editor.commands.insertContent('\n<h1>Tiptap</h1><p><strong>Hello\n World</strong>\n</p>\n', {
            parseOptions: { preserveWhitespace: false },
          })
        })

        const html = await editor.evaluate((el: HTMLElement) => el.innerHTML)

        expect(html).toContain('<h1>Tiptap</h1><p><strong>Hello World</strong></p>')
      })

      test('should split content when image is inserted inbetween text', async ({ page }) => {
        const editor = await getEditor(page)

        await editor.evaluate((el: any) => {
          el.editor.commands.insertContent('<p>HelloWorld</p>')
          el.editor.commands.setTextSelection(6)
          el.editor.commands.insertContent('<img src="https://example.image/1" alt="This is an example" />')
        })

        const html = await editor.evaluate((el: HTMLElement) => el.innerHTML)

        expect(html).toContain(
          '<p>Hello</p><img src="https://example.image/1" alt="This is an example" contenteditable="false" draggable="true"><p>World</p>',
        )
      })

      test('should not split content when image is inserted at beginning of text', async ({ page }) => {
        const editor = await getEditor(page)

        await editor.evaluate((el: any) => {
          el.editor.commands.insertContent('<p>HelloWorld</p>')
          el.editor.commands.setTextSelection(1)
          el.editor.commands.insertContent('<img src="https://example.image/1" alt="This is an example" />')
        })

        const html = await editor.evaluate((el: HTMLElement) => el.innerHTML)

        expect(html).toContain(
          '<img src="https://example.image/1" alt="This is an example" contenteditable="false" draggable="true"><p>HelloWorld</p>',
        )
      })

      test('should respect editor.options.parseOptions if defined to be `false`', async ({ page }) => {
        const editor = await getEditor(page)

        await editor.evaluate((el: any) => {
          el.editor.options.parseOptions = { preserveWhitespace: false }
          el.editor.commands.insertContent('\n<h1>Tiptap</h1><p><strong>Hello\n World</strong>\n</p>\n')
        })

        const html = await editor.evaluate((el: HTMLElement) => el.innerHTML)

        expect(html).toContain('<h1>Tiptap</h1><p><strong>Hello World</strong></p>')
      })

      test('should respect editor.options.parseOptions if defined to be `full`', async ({ page }) => {
        const editor = await getEditor(page)

        await editor.evaluate((el: any) => {
          el.editor.options.parseOptions = { preserveWhitespace: 'full' }
          el.editor.commands.insertContent('\n<h1>Tiptap</h1><p><strong>Hello\n World</strong>\n</p>\n')
        })

        const html = await editor.evaluate((el: HTMLElement) => el.innerHTML)

        expect(html).toContain('<h1>Tiptap</h1><p><strong>Hello\n World</strong></p>')
      })

      test('should respect editor.options.parseOptions if defined to be `true`', async ({ page }) => {
        const editor = await getEditor(page)

        await editor.evaluate((el: any) => {
          el.editor.options.parseOptions = { preserveWhitespace: true }
          el.editor.commands.insertContent('<h1>Tiptap</h1><p><strong>Hello\n World</strong>\n</p>')
        })

        const html = await editor.evaluate((el: HTMLElement) => el.innerHTML)

        expect(html).toContain('<h1>Tiptap</h1><p><strong>Hello  World</strong></p>')
      })
    })
  })
})
