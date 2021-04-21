context('/demos/Extensions/Focus', () => {
  before(() => {
    cy.visit('/demos/Extensions/Focus')
  })

  it('should have class', () => {
    cy.get('.ProseMirror p:first').should('have.class', 'has-focus')
  })
})
