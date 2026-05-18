import { expect, test } from '@playwright/test'

import { getEditor } from '../../../test/helpers.js'

const demoName = 'SetContent'
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

      test('should insert raw text content', async ({ page }) => {
        const editor = await getEditor(page)

        await editor.evaluate((el: any) => {
          el.editor.commands.setContent('Hello World.')
        })

        const html = await editor.evaluate((el: HTMLElement) => el.innerHTML)

        expect(html).toContain('<p>Hello World.</p>')
      })

      test('should insert raw JSON content', async ({ page }) => {
        const editor = await getEditor(page)

        await editor.evaluate((el: any) => {
          el.editor.commands.setContent({ type: 'paragraph', content: [{ type: 'text', text: 'Hello World.' }] })
        })

        const html = await editor.evaluate((el: HTMLElement) => el.innerHTML)

        expect(html).toContain('<p>Hello World.</p>')
      })

      test('should insert a Prosemirror Node as content', async ({ page }) => {
        const editor = await getEditor(page)

        await editor.evaluate((el: any) => {
          const e = el.editor
          e.commands.setContent(e.schema.node('paragraph', null, e.schema.text('Hello World.')))
        })

        const html = await editor.evaluate((el: HTMLElement) => el.innerHTML)

        expect(html).toContain('<p>Hello World.</p>')
      })

      test('should insert a Prosemirror Fragment as content', async ({ page }) => {
        const editor = await getEditor(page)

        await editor.evaluate((el: any) => {
          const e = el.editor
          e.commands.setContent(
            e.schema.node('doc', null, e.schema.node('paragraph', null, e.schema.text('Hello World.'))).content,
          )
        })

        const html = await editor.evaluate((el: HTMLElement) => el.innerHTML)

        expect(html).toContain('<p>Hello World.</p>')
      })

      test('should emit updates', async ({ page }) => {
        const editor = await getEditor(page)

        const result = await editor.evaluate((el: any) => {
          let updateCount = 0
          const callback = () => {
            updateCount += 1
          }

          el.editor.on('update', callback)
          el.editor.commands.setContent('Hello World.', { emitUpdate: true })
          const first = updateCount

          updateCount = 0
          el.editor.commands.setContent('Hello World again.', { emitUpdate: false })
          const second = updateCount
          el.editor.off('update', callback)

          return { first, second }
        })

        expect(result.first).toBe(1)
        expect(result.second).toBe(0)
      })

      test('should insert more complex html content', async ({ page }) => {
        const editor = await getEditor(page)

        await editor.evaluate((el: any) => {
          el.editor.commands.setContent(
            '<h1>Welcome to Tiptap</h1><p>This is a paragraph.</p><ul><li><p>List Item A</p></li><li><p>List Item B</p><ul><li><p>Subchild</p></li></ul></li></ul>',
          )
        })

        const html = await editor.evaluate((el: HTMLElement) => el.innerHTML)

        expect(html).toContain(
          '<h1>Welcome to Tiptap</h1><p>This is a paragraph.</p><ul><li><p>List Item A</p></li><li><p>List Item B</p><ul><li><p>Subchild</p></li></ul></li></ul>',
        )
      })

      test('should remove newlines and tabs', async ({ page }) => {
        const editor = await getEditor(page)

        await editor.evaluate((el: any) => {
          el.editor.commands.setContent('<p>Hello\n\tworld\n\t\thow\n\t\t\tnice.</p>')
        })

        const html = await editor.evaluate((el: HTMLElement) => el.innerHTML)

        expect(html).toContain('<p>Hello world how nice.</p>')
      })

      test('should keep newlines and tabs when preserveWhitespace = full', async ({ page }) => {
        const editor = await getEditor(page)

        await editor.evaluate((el: any) => {
          el.editor.commands.setContent('<p>Hello\n\tworld\n\t\thow\n\t\t\tnice.</p>', {
            parseOptions: { preserveWhitespace: 'full' },
          })
        })

        const html = await editor.evaluate((el: HTMLElement) => el.innerHTML)

        expect(html).toContain('<p>Hello\n\tworld\n\t\thow\n\t\t\tnice.</p>')
      })

      test('should overwrite existing content', async ({ page }) => {
        const editor = await getEditor(page)

        await editor.evaluate((el: any) => {
          el.editor.commands.setContent('<p>Initial Content</p>')
        })

        let html = await editor.evaluate((el: HTMLElement) => el.innerHTML)
        expect(html).toContain('<p>Initial Content</p>')

        await editor.evaluate((el: any) => {
          el.editor.commands.setContent('<p>Overwritten Content</p>')
        })

        html = await editor.evaluate((el: HTMLElement) => el.innerHTML)
        expect(html).toContain('<p>Overwritten Content</p>')

        await editor.evaluate((el: any) => {
          el.editor.commands.setContent('Content without tags')
        })

        html = await editor.evaluate((el: HTMLElement) => el.innerHTML)
        expect(html).toContain('<p>Content without tags</p>')
      })

      test('should insert mentions', async ({ page }) => {
        const editor = await getEditor(page)

        await editor.evaluate((el: any) => {
          el.editor.commands.setContent(
            '<p><span data-type="mention" data-id="1" data-label="John Doe">@John Doe</span></p>',
          )
        })

        const html = await editor.evaluate((el: HTMLElement) => el.innerHTML)

        expect(html).toContain(
          '<span data-type="mention" data-id="1" data-label="John Doe" data-mention-suggestion-char="@" contenteditable="false">@John Doe</span>',
        )
      })

      test('should remove newlines and tabs between html fragments', async ({ page }) => {
        const editor = await getEditor(page)

        await editor.evaluate((el: any) => {
          el.editor.commands.setContent('<h1>Tiptap</h1>\n\t<p><strong>Hello World</strong></p>')
        })

        const html = await editor.evaluate((el: HTMLElement) => el.innerHTML)

        expect(html).toContain('<h1>Tiptap</h1><p><strong>Hello World</strong></p>')
      })

      test('should keep newlines and tabs between html fragments when preserveWhitespace = full', async ({ page }) => {
        const editor = await getEditor(page)

        await editor.evaluate((el: any) => {
          el.editor.commands.setContent('<h1>Tiptap</h1>\n\t<p><strong>Hello World</strong></p>', {
            parseOptions: { preserveWhitespace: 'full' },
          })
        })

        const html = await editor.evaluate((el: HTMLElement) => el.innerHTML)

        expect(html).toContain('<h1>Tiptap</h1><p>\n\t</p><p><strong>Hello World</strong></p>')
      })

      test('should allow inserting nothing', async ({ page }) => {
        const editor = await getEditor(page)

        await editor.evaluate((el: any) => {
          el.editor.commands.setContent('')
        })

        const html = await editor.evaluate((el: HTMLElement) => el.innerHTML)

        expect(html).toBeDefined()
      })

      test('should allow inserting nothing when preserveWhitespace = full', async ({ page }) => {
        const editor = await getEditor(page)

        await editor.evaluate((el: any) => {
          el.editor.commands.setContent('', { parseOptions: { preserveWhitespace: 'full' } })
        })

        const html = await editor.evaluate((el: HTMLElement) => el.innerHTML)

        expect(html).toBeDefined()
      })

      test('should allow inserting a partial HTML tag', async ({ page }) => {
        const editor = await getEditor(page)

        await editor.evaluate((el: any) => {
          el.editor.commands.setContent('<p>foo')
        })

        const html = await editor.evaluate((el: HTMLElement) => el.innerHTML)

        expect(html).toContain('<p>foo</p>')
      })

      test('should allow inserting a partial HTML tag when preserveWhitespace = full', async ({ page }) => {
        const editor = await getEditor(page)

        await editor.evaluate((el: any) => {
          el.editor.commands.setContent('<p>foo', { parseOptions: { preserveWhitespace: 'full' } })
        })

        const html = await editor.evaluate((el: HTMLElement) => el.innerHTML)

        expect(html).toContain('<p>foo</p>')
      })

      test('will remove an incomplete HTML tag', async ({ page }) => {
        const editor = await getEditor(page)

        await editor.evaluate((el: any) => {
          el.editor.commands.setContent('foo<p')
        })

        const html = await editor.evaluate((el: HTMLElement) => el.innerHTML)

        expect(html).toContain('<p>foo</p>')
      })

      test('should allow inserting an incomplete HTML tag when preserveWhitespace = full', async ({ page }) => {
        const editor = await getEditor(page)

        await editor.evaluate((el: any) => {
          el.editor.commands.setContent('foo<p', { parseOptions: { preserveWhitespace: 'full' } })
        })

        const html = await editor.evaluate((el: HTMLElement) => el.innerHTML)

        expect(html).toContain('<p>foo&lt;p</p>')
      })

      test('should allow inserting a list', async ({ page }) => {
        const editor = await getEditor(page)

        await editor.evaluate((el: any) => {
          el.editor.commands.setContent('<ul><li>ABC</li><li>123</li></ul>')
        })

        const html = await editor.evaluate((el: HTMLElement) => el.innerHTML)

        expect(html).toContain('<ul><li><p>ABC</p></li><li><p>123</p></li></ul>')
      })

      test('should allow inserting a list when preserveWhitespace = full', async ({ page }) => {
        const editor = await getEditor(page)

        await editor.evaluate((el: any) => {
          el.editor.commands.setContent('<ul><li>ABC</li><li>123</li></ul>', {
            parseOptions: { preserveWhitespace: 'full' },
          })
        })

        const html = await editor.evaluate((el: HTMLElement) => el.innerHTML)

        expect(html).toContain('<ul><li><p>ABC</p></li><li><p>123</p></li></ul>')
      })

      test('should remove newlines and tabs when parseOptions.preserveWhitespace=false', async ({ page }) => {
        const editor = await getEditor(page)

        await editor.evaluate((el: any) => {
          el.editor.commands.setContent('\n<h1>Tiptap</h1><p><strong>Hello\n World</strong>\n</p>\n', {
            parseOptions: { preserveWhitespace: false },
          })
        })

        const html = await editor.evaluate((el: HTMLElement) => el.innerHTML)

        expect(html).toContain('<h1>Tiptap</h1><p><strong>Hello World</strong></p>')
      })
    })
  })
})
