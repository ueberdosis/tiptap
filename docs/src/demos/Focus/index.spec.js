context('read-only', () => {
  beforeEach(() => {
    cy.visit('/examples/focus')
  })

  describe('editable', () => {
    it('should have class', () => {
      cy.get('.ProseMirror').window().then(window => {
        cy.get('.ProseMirror p:first').should('have.class', 'has-focus')
      })
    })
  })
})