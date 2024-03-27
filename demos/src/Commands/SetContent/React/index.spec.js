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

  it('should insert more complex html content', () => {
    cy.get('.tiptap').then(([{ editor }]) => {
      editor.commands.setContent('<h1>Welcome to Tiptap</h1><p>This is a paragraph.</p><ul><li><p>List Item A</p></li><li><p>List Item B</p><ul><li><p>Subchild</p></li></ul></li></ul>')
      cy.get('.tiptap').should('contain.html', '<h1>Welcome to Tiptap</h1><p>This is a paragraph.</p><ul><li><p>List Item A</p></li><li><p>List Item B</p><ul><li><p>Subchild</p></li></ul></li></ul>')
    })
  })

  it('should keep newlines and tabs', () => {
    cy.get('.tiptap').then(([{ editor }]) => {
      editor.commands.setContent('<p>Hello\n\tworld\n\t\thow\n\t\t\tnice.</p>')
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
      cy.get('.tiptap').should('contain.html', '<span contenteditable="false">@John Doe</span>')
    })
  })
})
