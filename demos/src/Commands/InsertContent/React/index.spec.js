context('/src/Commands/InsertContent/React/', () => {
  before(() => {
    cy.visit('/src/Commands/InsertContent/React/')
  })

  beforeEach(() => {
    cy.get('.tiptap').type('{selectall}{backspace}')
  })

  it('should insert html content correctly', () => {
    cy.get('button[data-test-id="html-content"]').click()

    // check if the content html is correct
    cy.get('.tiptap').should('contain.html', '<h1><a target="_blank" rel="noopener noreferrer nofollow" href="https://tiptap.dev/">Tiptap</a></h1><p><strong>Hello World</strong></p><p>This is a paragraph<br>with a break.</p><p>And this is some additional string content.</p>')
  })

  it('should keep spaces inbetween tags in html content', () => {
    cy.get('.tiptap').then(([{ editor }]) => {
      editor.commands.insertContent('<p><b>Hello</b> <i>World</i></p>')
      cy.get('.tiptap').should('contain.html', '<p><strong>Hello</strong> <em>World</em></p>')
    })
  })

  it('should keep empty spaces', () => {
    cy.get('.tiptap').then(([{ editor }]) => {
      editor.commands.insertContent('  ')
      cy.get('.tiptap').should('contain.html', '<p>  </p>')
    })
  })

  it('should insert text content correctly', () => {
    cy.get('button[data-test-id="text-content"]').click()

    // check if the content html is correct
    cy.get('.tiptap').should('contain.html', 'Hello World\nThis is content with a new line. Is this working?\n\nLets see if multiple new lines are inserted correctly')
  })

  it('should keep newlines in pre tag', () => {
    cy.get('.tiptap').then(([{ editor }]) => {
      editor.commands.insertContent('<pre><code>foo\nbar</code></pre>')
      cy.get('.tiptap').should('contain.html', '<pre><code>foo\nbar</code></pre>')
    })
  })

  it('should keep newlines and tabs', () => {
    cy.get('.tiptap').then(([{ editor }]) => {
      editor.commands.insertContent('<p>Hello\n\tworld\n\t\thow\n\t\t\tnice.\ntest\tOK</p>')
      cy.get('.tiptap').should('contain.html', '<p>Hello\n\tworld\n\t\thow\n\t\t\tnice.\ntest\tOK</p>')
    })
  })

  it('should keep newlines and tabs', () => {
    cy.get('.tiptap').then(([{ editor }]) => {
      editor.commands.insertContent('<h1>Tiptap</h1>\n<p><strong>Hello World</strong></p>')
      cy.get('.tiptap').should('contain.html', '<h1>Tiptap</h1><p><strong>Hello World</strong></p>')
    })
  })

  it('should allow inserting nothing', () => {
    cy.get('.tiptap').then(([{ editor }]) => {
      editor.commands.insertContent('')
      cy.get('.tiptap').should('contain.html', '')
    })
  })

  it('should allow inserting a partial HTML tag', () => {
    cy.get('.tiptap').then(([{ editor }]) => {
      editor.commands.insertContent('<p>foo')
      cy.get('.tiptap').should('contain.html', '<p>foo</p>')
    })
  })

  it('should allow inserting an incomplete HTML tag', () => {
    cy.get('.tiptap').then(([{ editor }]) => {
      editor.commands.insertContent('foo<p')
      cy.get('.tiptap').should('contain.html', '<p>foo&lt;p</p>')
    })
  })

  it('should allow inserting a list', () => {
    cy.get('.tiptap').then(([{ editor }]) => {
      editor.commands.insertContent('<ul><li>ABC</li><li>123</li></ul>')
      cy.get('.tiptap').should('contain.html', '<ul><li><p>ABC</p></li><li><p>123</p></li></ul>')
    })
  })

  it('should remove newlines and tabs when parseOptions.preserveWhitespace=false', () => {
    cy.get('.tiptap').then(([{ editor }]) => {
      editor.commands.insertContent('\n<h1>Tiptap</h1><p><strong>Hello\n World</strong>\n</p>\n', { parseOptions: { preserveWhitespace: false } })
      cy.get('.tiptap').should('contain.html', '<h1>Tiptap</h1><p><strong>Hello World</strong></p>')
    })
  })

  it('should respect editor.options.parseOptions if defined to be `false`', () => {
    cy.get('.tiptap').then(([{ editor }]) => {
      editor.options.parseOptions = { preserveWhitespace: false }
      editor.commands.insertContent('\n<h1>Tiptap</h1><p><strong>Hello\n World</strong>\n</p>\n')
      cy.get('.tiptap').should('contain.html', '<h1>Tiptap</h1><p><strong>Hello World</strong></p>')
    })
  })

  it('should respect editor.options.parseOptions if defined to be `full`', () => {
    cy.get('.tiptap').then(([{ editor }]) => {
      editor.options.parseOptions = { preserveWhitespace: 'full' }
      editor.commands.insertContent('\n<h1>Tiptap</h1><p><strong>Hello\n World</strong>\n</p>\n')
      cy.get('.tiptap').should('contain.html', '<h1>Tiptap</h1><p><strong>Hello\n World</strong></p>')
    })
  })

  it('should respect editor.options.parseOptions if defined to be `true`', () => {
    cy.get('.tiptap').then(([{ editor }]) => {
      editor.options.parseOptions = { preserveWhitespace: true }
      editor.commands.insertContent('<h1>Tiptap</h1><p><strong>Hello\n World</strong>\n</p>')
      cy.get('.tiptap').should('contain.html', '<h1>Tiptap</h1><p><strong>Hello  World</strong></p>')
    })
  })

})
