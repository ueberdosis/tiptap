context('/guide/store-content', () => {
  beforeEach(() => {
    cy.visit('/guide/store-content')
  })

  it.skip('should be read-only', () => {
    cy.get('.ProseMirror').then(([{ editor }]) => {
      cy.get('#editable').uncheck()

      editor.commands.insertText('Edited: ')

      cy.get('.ProseMirror p:first').should('not.contain', 'Edited: ')
    })
  })

  it.skip('should be editable', () => {
    cy.get('.ProseMirror').then(([{ editor }]) => {
      cy.get('#editable').check()

      editor.commands.insertText('Edited: ')

      cy.get('.ProseMirror p:first').should('contain', 'Edited: ')
    })
  })
})
