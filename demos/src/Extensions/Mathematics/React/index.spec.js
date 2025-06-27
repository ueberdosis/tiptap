context('/src/Extensions/Mathematics/React/', () => {
  beforeEach(() => {
    cy.visit('/src/Extensions/Mathematics/React/')
  })

  it('should include katex-rendered inline and block nodes', () => {
    cy.get('.tiptap').then(() => {
      cy.get('.tiptap span[data-type="inline-math"]').should('have.length', 18)
      cy.get('.tiptap div[data-type="block-math"]').should('have.length', 1)

      cy.get('.tiptap span[data-type="inline-math"] .katex').should('have.length', 18)
      cy.get('.tiptap div[data-type="block-math"] .katex').should('have.length', 1)
    })
  })
})
