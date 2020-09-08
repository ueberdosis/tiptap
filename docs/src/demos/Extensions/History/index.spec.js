context('/api/extensions/history', () => {
  beforeEach(() => {
    cy.visit('/api/extensions/history')

    cy.get('.ProseMirror').window().then(window => {
      const { editor } = window
      editor.setContent('<p>Mistake</p>')
    })
  })

  describe('undo', () => {
    it('should make the last change undone', () => {
      cy.get('.ProseMirror').window().then(window => {
        cy.get('.ProseMirror').should('contain', 'Mistake')

        cy.get('.demo__preview button:first').click({ force: true })
        cy.get('.ProseMirror').should('not.contain', 'Mistake')
      })
    })

    it('the keyboard shortcut should make the last change undone', () => {
      const shortcut = Cypress.platform === 'darwin' ? '{meta}z' : '{ctrl}z'

      cy.get('.ProseMirror').type(shortcut, {force: true})
      cy.get('.ProseMirror').should('not.contain', 'Mistake')
    })
  })

  describe('redo', () => {
    it('should apply the last undone change again', () => {
      cy.get('.ProseMirror').window().then(window => {
        cy.get('.ProseMirror').should('contain', 'Mistake')

        cy.get('.demo__preview button:first').click({ force: true })
        cy.get('.ProseMirror').should('not.contain', 'Mistake')
        cy.get('.demo__preview button:nth-child(2)').click({ force: true })
        cy.get('.ProseMirror').should('contain', 'Mistake')
      })
    })

    it('the keyboard shortcut should apply the last undone change again', () => {
      const undoShortcut = Cypress.platform === 'darwin' ? '{meta}z' : '{ctrl}z'
      const redoShortcut = Cypress.platform === 'darwin' ? '{meta}{shift}z' : '{ctrl}{shift}z'

      cy.get('.ProseMirror').type(undoShortcut, {force: true})
      cy.get('.ProseMirror').should('not.contain', 'Mistake')

      cy.get('.ProseMirror').type(redoShortcut, {force: true})
      cy.get('.ProseMirror').should('contain', 'Mistake')
    })
  })
})
