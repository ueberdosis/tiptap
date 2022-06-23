context('/src/Extensions/Decorators/React/', () => {
  before(() => {
    cy.visit('/src/Extensions/Decorators/React/')
  })

  // TODO: Write tests
  it('should have decorators', () => {
    cy.get('[class*="prosemirror--decorator"]').should('exist')
  })
})
