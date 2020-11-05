context('/api/extensions/focus', () => {
  before(() => {
    cy.visit('/api/extensions/focus')
  })

  it('should have class', () => {
    cy.get('.ProseMirror p:first').should('have.class', 'has-focus')
  })
})
