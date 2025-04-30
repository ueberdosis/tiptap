context('/src/Examples/StaticRenderingAdvanced/React/', () => {
  beforeEach(() => {
    cy.visit('/src/Examples/StaticRenderingAdvanced/React/')
  })

  it('should render the content as HTML', () => {
    cy.get('p').should('exist')
  })
})
