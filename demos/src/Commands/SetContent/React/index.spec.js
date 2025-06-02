context('/src/Commands/SetContent/React/', () => {
  before(() => {
    cy.visit('/src/Commands/SetContent/React/')
  })

  beforeEach(() => {
    cy.get('.tiptap').type('{selectall}{backspace}')
  })

  it('should insert raw text content', () => {
    cy.get('.tiptap').then(([{ editor }]) => {
      editor.commands.setContent('Hello World.')
      cy.get('.tiptap').should('contain.html', '<p>Hello World.</p>')
    })
  })

  it('should insert raw JSON content', () => {
    cy.get('.tiptap').then(([{ editor }]) => {
      editor.commands.setContent({ type: 'paragraph', content: [{ type: 'text', text: 'Hello World.' }] })
      cy.get('.tiptap').should('contain.html', '<p>Hello World.</p>')
    })
  })

  it('should insert a Prosemirror Node as content', () => {
    cy.get('.tiptap').then(([{ editor }]) => {
      editor.commands.setContent(editor.schema.node('paragraph', null, editor.schema.text('Hello World.')))
      cy.get('.tiptap').should('contain.html', '<p>Hello World.</p>')
    })
  })

  it('should insert a Prosemirror Fragment as content', () => {
    cy.get('.tiptap').then(([{ editor }]) => {
      editor.commands.setContent(editor.schema.node('doc', null, editor.schema.node('paragraph', null, editor.schema.text('Hello World.'))).content)
      cy.get('.tiptap').should('contain.html', '<p>Hello World.</p>')
    })
  })

  it('should emit updates', () => {
    cy.get('.tiptap').then(([{ editor }]) => {
      let updateCount = 0
      const callback = () => {
        updateCount += 1
      }

      editor.on('update', callback)
      // emit an update
      editor.commands.setContent('Hello World.', true)
      expect(updateCount).to.equal(1)

      updateCount = 0
      // do not emit an update
      editor.commands.setContent('Hello World again.', false)
      expect(updateCount).to.equal(0)
      editor.off('update', callback)
    })
  })

  it('should insert more complex html content', () => {
    cy.get('.tiptap').then(([{ editor }]) => {
      editor.commands.setContent('<h1>Welcome to Tiptap</h1><p>This is a paragraph.</p><ul><li><p>List Item A</p></li><li><p>List Item B</p><ul><li><p>Subchild</p></li></ul></li></ul>')
      cy.get('.tiptap').should('contain.html', '<h1>Welcome to Tiptap</h1><p>This is a paragraph.</p><ul><li><p>List Item A</p></li><li><p>List Item B</p><ul><li><p>Subchild</p></li></ul></li></ul>')
    })
  })

  it('should remove newlines and tabs', () => {
    cy.get('.tiptap').then(([{ editor }]) => {
      editor.commands.setContent('<p>Hello\n\tworld\n\t\thow\n\t\t\tnice.</p>')
      cy.get('.tiptap').should('contain.html', '<p>Hello world how nice.</p>')
    })
  })

  it('should keep newlines and tabs when preserveWhitespace = full', () => {
    cy.get('.tiptap').then(([{ editor }]) => {
      editor.commands.setContent('<p>Hello\n\tworld\n\t\thow\n\t\t\tnice.</p>', false, { preserveWhitespace: 'full' })
      cy.get('.tiptap').should('contain.html', '<p>Hello\n\tworld\n\t\thow\n\t\t\tnice.</p>')
    })
  })

  it('should overwrite existing content', () => {
    cy.get('.tiptap').then(([{ editor }]) => {
      editor.commands.setContent('<p>Initial Content</p>')
      cy.get('.tiptap').should('contain.html', '<p>Initial Content</p>')
    })
    cy.get('.tiptap').then(([{ editor }]) => {
      editor.commands.setContent('<p>Overwritten Content</p>')
      cy.get('.tiptap').should('contain.html', '<p>Overwritten Content</p>')
    })
    cy.get('.tiptap').then(([{ editor }]) => {
      editor.commands.setContent('Content without tags')
      cy.get('.tiptap').should('contain.html', '<p>Content without tags</p>')
    })
  })

  it('should insert mentions', () => {
    cy.get('.tiptap').then(([{ editor }]) => {
      editor.commands.setContent('<p><span data-type="mention" data-id="1" data-label="John Doe">@John Doe</span></p>')
      cy.get('.tiptap').should('contain.html', '<span data-type="mention" data-id="1" data-label="John Doe" contenteditable="false">@John Doe</span>')
    })
  })

  it('should remove newlines and tabs between html fragments', () => {
    cy.get('.tiptap').then(([{ editor }]) => {
      editor.commands.setContent('<h1>Tiptap</h1>\n\t<p><strong>Hello World</strong></p>')
      cy.get('.tiptap').should('contain.html', '<h1>Tiptap</h1><p><strong>Hello World</strong></p>')
    })
  })

  // TODO I'm not certain about this behavior and what it should do...
  // This exists in insertContentAt as well
  it('should keep newlines and tabs between html fragments when preserveWhitespace = full', () => {
    cy.get('.tiptap').then(([{ editor }]) => {
      editor.commands.setContent('<h1>Tiptap</h1>\n\t<p><strong>Hello World</strong></p>', false, { preserveWhitespace: 'full' })
      cy.get('.tiptap').should('contain.html', '<h1>Tiptap</h1><p>\n\t</p><p><strong>Hello World</strong></p>')
    })
  })

  it('should allow inserting nothing', () => {
    cy.get('.tiptap').then(([{ editor }]) => {
      editor.commands.setContent('')
      cy.get('.tiptap').should('contain.html', '')
    })
  })

  it('should allow inserting nothing when preserveWhitespace = full', () => {
    cy.get('.tiptap').then(([{ editor }]) => {
      editor.commands.setContent('', false, { preserveWhitespace: 'full' })
      cy.get('.tiptap').should('contain.html', '')
    })
  })

  it('should allow inserting a partial HTML tag', () => {
    cy.get('.tiptap').then(([{ editor }]) => {
      editor.commands.setContent('<p>foo')
      cy.get('.tiptap').should('contain.html', '<p>foo</p>')
    })
  })

  it('should allow inserting a partial HTML tag when preserveWhitespace = full', () => {
    cy.get('.tiptap').then(([{ editor }]) => {
      editor.commands.setContent('<p>foo', false, { preserveWhitespace: 'full' })
      cy.get('.tiptap').should('contain.html', '<p>foo</p>')
    })
  })

  it('will remove an incomplete HTML tag', () => {
    cy.get('.tiptap').then(([{ editor }]) => {
      editor.commands.setContent('foo<p')
      cy.get('.tiptap').should('contain.html', '<p>foo</p>')
    })
  })

  // TODO I'm not certain about this behavior and what it should do...
  // This exists in insertContentAt as well
  it('should allow inserting an incomplete HTML tag when preserveWhitespace = full', () => {
    cy.get('.tiptap').then(([{ editor }]) => {
      editor.commands.setContent('foo<p', false, { preserveWhitespace: 'full' })
      cy.get('.tiptap').should('contain.html', '<p>foo&lt;p</p>')
    })
  })

  it('should allow inserting a list', () => {
    cy.get('.tiptap').then(([{ editor }]) => {
      editor.commands.setContent('<ul><li>ABC</li><li>123</li></ul>')
      cy.get('.tiptap').should('contain.html', '<ul><li><p>ABC</p></li><li><p>123</p></li></ul>')
    })
  })

  it('should allow inserting a list when preserveWhitespace = full', () => {
    cy.get('.tiptap').then(([{ editor }]) => {
      editor.commands.setContent('<ul><li>ABC</li><li>123</li></ul>', false, { preserveWhitespace: 'full' })
      cy.get('.tiptap').should('contain.html', '<ul><li><p>ABC</p></li><li><p>123</p></li></ul>')
    })
  })

  it('should remove newlines and tabs when parseOptions.preserveWhitespace=false', () => {
    cy.get('.tiptap').then(([{ editor }]) => {
      editor.commands.setContent('\n<h1>Tiptap</h1><p><strong>Hello\n World</strong>\n</p>\n', false, { preserveWhitespace: false })
      cy.get('.tiptap').should('contain.html', '<h1>Tiptap</h1><p><strong>Hello World</strong></p>')
    })
  })
})
