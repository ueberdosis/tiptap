context('/examples/read-only', () => {
  beforeEach(() => {
    cy.visit('/examples/read-only')
  })

  describe('editable', () => {
    it.skip('should be read-only', () => {
      cy.get('.ProseMirror').window().then(window => {
        cy.get('#editable').uncheck()

        const { editor } = window
        editor.insertText('Edited: ')

        cy.get('.ProseMirror p:first').should('not.contain', 'Edited: ')
      })
    })

    it.skip('should be editable', () => {
      cy.get('.ProseMirror').window().then(window => {
        cy.get('#editable').check()

        const { editor } = window
        editor.insertText('Edited: ')

        cy.get('.ProseMirror p:first').should('contain', 'Edited: ')
      })
    })
  })
})