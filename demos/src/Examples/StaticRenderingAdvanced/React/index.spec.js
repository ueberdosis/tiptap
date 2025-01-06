context('/src/Examples/StaticRenderingAdvanced/React/', () => {
  before(() => {
    cy.visit('/src/Examples/StaticRenderingAdvanced/React/')
  })

  it('should render the content as HTML', () => {
    cy.get('p').should('exist')
  })
})
