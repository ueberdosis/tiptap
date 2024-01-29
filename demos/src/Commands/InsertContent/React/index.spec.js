context('/src/Commands/InsertContent/React/', () => {
  before(() => {
    cy.visit('/src/Issues/2720/React/')
  })

  beforeEach(() => {
    cy.get('.tiptap').type('{selectall}{backspace}')
  })

  it('should insert html content correctly', () => {
    cy.get('button[data-test-id="html-content"]').click()

    // check if the content html is correct
    cy.get('.tiptap').should('contain.html', '<h1>Tiptap</h1><p><strong>Hello World</strong></p><p>This is a paragraph<br>with a break.</p><p>And this is some additional string content.</p>')
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
})
