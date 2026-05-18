context('/src/Extensions/Selection/Vue/', () => {
  beforeEach(() => {
    cy.visit('/src/Extensions/Selection/Vue/')
  })

  it('should have class', () => {
    cy.get('.tiptap span:first').should('have.class', 'selection')
  })
})
