context('/src/GuideContent/GenerateHTML/Vue/', () => {
  beforeEach(() => {
    cy.visit('/src/GuideContent/GenerateHTML/Vue/')
  })

  it('should render the content as an HTML string', () => {
    cy.get('pre code').should('exist')

    cy.get('pre code').should('contain', '<p xmlns="http://www.w3.org/1999/xhtml">Example <strong>Text</strong></p>')
  })
})
