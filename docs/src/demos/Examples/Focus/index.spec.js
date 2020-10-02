context('/examples/focus', () => {
  before(() => {
    cy.visit('/examples/focus')
  })

  it('should have class', () => {
    cy.get('.ProseMirror').then(([{ editor }]) => {
      cy.get('.ProseMirror p:first').should('have.class', 'has-focus')
    })
  })
})
