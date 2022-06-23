context('/src/Extensions/Decorators/Vue/', () => {
  before(() => {
    cy.visit('/src/Extensions/Decorators/Vue/')
  })

  // TODO: Write tests
  it('should have decorators', () => {
    cy.get('[class*="prosemirror--decorator"]').should('exist')
  })
})
