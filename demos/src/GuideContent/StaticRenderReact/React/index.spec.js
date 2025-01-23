context('/src/GuideContent/StaticRenderReact/React/', () => {
  beforeEach(() => {
    cy.visit('/src/GuideContent/StaticRenderReact/React/')
  })

  it('should render the content as HTML', () => {
    cy.get('p').should('exist')
    cy.get('p').should('contain', 'Example')

    cy.get('p strong').should('exist')
    cy.get('p strong').should('contain', 'Text')
  })
})
