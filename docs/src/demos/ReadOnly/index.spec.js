context('read-only', () => {
  beforeEach(() => {
    cy.visit('/examples/read-only')
  })


  describe('editable', () => {
    it('should be editable', () => {
      cy.get('.ProseMirror').window().then(window => {
        const { editor } = window

        cy.get('#editable').check()

        editor.insertText('Edited: ')

        cy.get('.ProseMirror h2:first')
          .should('contain', 'Edited: ')
      })
    })

    it('should be read-only', () => {
      cy.get('.ProseMirror').window().then(window => {
        const { editor } = window

        cy.get('#editable').uncheck()

        editor.insertText('Edited: ')

        cy.get('.ProseMirror h2:first')
          .should('not.contain', 'Edited: ')
      })
    })

  })
})