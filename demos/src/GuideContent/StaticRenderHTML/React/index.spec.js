context('/src/GuideContent/StaticRenderHTML/React/', () => {
  before(() => {
    cy.visit('/src/GuideContent/StaticRenderHTML/React/')
  })

  it('should render the content as an HTML string', () => {
    cy.get('pre code').should('exist')

    cy.get('pre code').should('contain', '<p>Example <strong>Text</strong></p>')
  })
})
