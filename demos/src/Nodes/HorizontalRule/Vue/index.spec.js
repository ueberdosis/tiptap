context('/src/Nodes/HorizontalRule/Vue/', () => {
  before(() => {
    cy.visit('/src/Nodes/HorizontalRule/Vue/')
  })

  beforeEach(() => {
    cy.get('.ProseMirror').then(([{ editor }]) => {
      editor.commands.setContent('<p>Example Text</p>')
    })
  })

  it('should parse horizontal rules correctly', () => {
    cy.get('.ProseMirror').then(([{ editor }]) => {
      editor.commands.setContent('<p>Example Text</p><hr>')
      expect(editor.getHTML()).to.eq('<p>Example Text</p><hr>')
    })
  })

  it('should parse horizontal rules with self-closing tag correctly', () => {
    cy.get('.ProseMirror').then(([{ editor }]) => {
      editor.commands.setContent('<p>Example Text</p><hr />')
      expect(editor.getHTML()).to.eq('<p>Example Text</p><hr>')
    })
  })

  it('the button should add a horizontal rule', () => {
    cy.get('.ProseMirror hr')
      .should('not.exist')

    cy.get('button:first')
      .click()

    cy.get('.ProseMirror hr')
      .should('exist')
  })

  it('the default markdown shortcut should add a horizontal rule', () => {
    cy.get('.ProseMirror').then(([{ editor }]) => {
      editor.commands.clearContent()

      cy.get('.ProseMirror hr')
        .should('not.exist')

      cy.get('.ProseMirror')
        .type('---')

      cy.get('.ProseMirror hr')
        .should('exist')
    })
  })

  it('the alternative markdown shortcut should add a horizontal rule', () => {
    cy.get('.ProseMirror').then(([{ editor }]) => {
      editor.commands.clearContent()

      cy.get('.ProseMirror hr')
        .should('not.exist')

      cy.get('.ProseMirror')
        .type('___ ')

      cy.get('.ProseMirror hr')
        .should('exist')
    })
  })
})
