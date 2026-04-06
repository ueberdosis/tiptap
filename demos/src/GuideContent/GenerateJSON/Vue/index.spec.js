context('/src/GuideContent/GenerateJSON/Vue/', () => {
  beforeEach(() => {
    cy.visit('/src/GuideContent/GenerateJSON/Vue/')
  })

  it('should render the content as an HTML string', () => {
    cy.get('pre code').should('exist')

    cy.get('pre code').should('contain', '"type": "paragraph"')
    cy.get('pre code').should('contain', '"text": "Example "')
    cy.get('pre code').should('contain', '"type": "bold"')
    cy.get('pre code').should('contain', '"text": "Text"')
  })
})
