context('/src/GuideContent/StaticRenderHTML/Vue/', () => {
  beforeEach(() => {
    cy.visit('/src/GuideContent/StaticRenderHTML/Vue/')
  })

  it('should render the content as an HTML string', () => {
    cy.get('pre code').should('exist')

    cy.get('pre code').should('contain', '<p>Example <strong>Text</strong></p>')
  })
})
