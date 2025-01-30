context('/src/Extensions/Selection/React/', () => {
  beforeEach(() => {
    cy.visit('/src/Extensions/Selection/React/')
  })

  it('should have class', () => {
    cy.get('.tiptap span:first').should('have.class', 'selection')
  })
})
