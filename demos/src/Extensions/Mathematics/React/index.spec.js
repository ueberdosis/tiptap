context('/src/Extensions/Mathematics/React/', () => {
  beforeEach(() => {
    cy.visit('/src/Extensions/Mathematics/React/')
  })

  it('should include katex-rendered inline and block nodes', () => {
    cy.get('.ProseMirror').then(() => {
      cy.get('.ProseMirror span[data-type="inline-math"]').should('have.length', 18)
      cy.get('.ProseMirror div[data-type="block-math"]').should('have.length', 1)

      cy.get('.ProseMirror span[data-type="inline-math"] .katex').should('have.length', 18)
      cy.get('.ProseMirror div[data-type="block-math"] .katex').should('have.length', 1)
    })
  })
})
