context('/src/Examples/CSSModules/Vue/', () => {
  beforeEach(() => {
    cy.visit('/src/Examples/CSSModules/Vue/')
  })

  it('should apply a randomly generated class that adds padding and background color to the toolbar', () => {
    cy.get('.toolbar').should('exist')
    cy.get('.toolbar').should('have.css', 'background-color', 'rgb(255, 0, 0)')
    cy.get('.toolbar').should('have.css', 'padding', '16px')
  })
})
