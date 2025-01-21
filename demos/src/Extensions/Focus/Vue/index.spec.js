context('/src/Extensions/Focus/Vue/', () => {
  beforeEach(() => {
    cy.visit('/src/Extensions/Focus/Vue/')
  })

  it('should have class', () => {
    cy.get('.tiptap p:first').should('have.class', 'has-focus')
  })
})
