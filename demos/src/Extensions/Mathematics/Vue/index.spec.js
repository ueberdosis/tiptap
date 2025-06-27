context('/src/Extensions/Mathematics/Vue/', () => {
  beforeEach(() => {
    cy.visit('/src/Extensions/Mathematics/Vue/')
  })

  it('should include katex-rendered inline and block nodes', () => {
    cy.get('.tiptap').then(() => {
      cy.get('.tiptap span[data-type="inline-math"]').should('have.length', 19)
      cy.get('.tiptap div[data-type="block-math"]').should('have.length', 1)

      cy.get('.tiptap span[data-type="inline-math"] .katex').should('have.length', 19)
      cy.get('.tiptap div[data-type="block-math"] .katex').should('have.length', 1)
    })
  })
})
