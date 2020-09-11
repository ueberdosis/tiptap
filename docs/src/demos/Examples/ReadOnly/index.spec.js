context('/examples/read-only', () => {
  beforeEach(() => {
    cy.visit('/examples/read-only')
  })

  it.skip('should be read-only', () => {
    cy.get('.ProseMirror').then(([{ editor }]) => {
      cy.get('#editable').uncheck()

      editor.insertText('Edited: ')

      cy.get('.ProseMirror p:first').should('not.contain', 'Edited: ')
    })
  })

  it.skip('should be editable', () => {
    cy.get('.ProseMirror').then(([{ editor }]) => {
      cy.get('#editable').check()

      editor.insertText('Edited: ')

      cy.get('.ProseMirror p:first').should('contain', 'Edited: ')
    })
  })
})