context('/src/Nodes/HorizontalRule/React/', () => {
  before(() => {
    cy.visit('/src/Nodes/HorizontalRule/React/')
  })

  beforeEach(() => {
    cy.get('.tiptap').then(([{ editor }]) => {
      editor.commands.setContent('<p>Example Text</p>')
    })
  })

  it('should parse horizontal rules correctly', () => {
    cy.get('.tiptap').then(([{ editor }]) => {
      editor.commands.setContent('<p>Example Text</p><hr>')
      expect(editor.getHTML()).to.eq('<p>Example Text</p><hr>')
    })
  })

  it('should parse horizontal rules with self-closing tag correctly', () => {
    cy.get('.tiptap').then(([{ editor }]) => {
      editor.commands.setContent('<p>Example Text</p><hr />')
      expect(editor.getHTML()).to.eq('<p>Example Text</p><hr>')
    })
  })

  it('the button should add a horizontal rule', () => {
    cy.get('.tiptap hr').should('not.exist')

    cy.get('button:first').click()

    cy.get('.tiptap hr').should('exist')
  })

  it('the default markdown shortcut should add a horizontal rule', () => {
    cy.get('.tiptap').then(([{ editor }]) => {
      editor.commands.clearContent()

      cy.get('.tiptap hr').should('not.exist')

      cy.get('.tiptap').type('---')

      cy.get('.tiptap hr').should('exist')
    })
  })

  it('the alternative markdown shortcut should add a horizontal rule', () => {
    cy.get('.tiptap').then(([{ editor }]) => {
      editor.commands.clearContent()

      cy.get('.tiptap hr').should('not.exist')

      cy.get('.tiptap').type('___ ')

      cy.get('.tiptap hr').should('exist')
    })
  })
})
