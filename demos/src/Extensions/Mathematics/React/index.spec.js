context('/src/Extensions/Mathematics/React/', () => {
  beforeEach(() => {
    cy.visit('/src/Extensions/Mathematics/React/')
  })

  // TODO: Write tests
  it('should render latex tags when no focus', () => {
    cy.get('.ProseMirror').then(() => {
      // find latex tags by class .katex
      cy.get('.katex').should('exist')
      cy.get('.katex').should('have.length', 18)
      cy.get('.katex').should('be.visible')
    })
  })

  it('should not render latex tags in codeBlock', () => {
    cy.get('.ProseMirror').then(() => {
      cy.get('.ProseMirror pre code .katex').should('not.exist')
    })
  })
})
