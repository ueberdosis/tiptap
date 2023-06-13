context('/src/Extensions/Focus/Vue/', () => {
  before(() => {
    cy.visit('/src/Extensions/Focus/Vue/')
  })

  it('should have class', () => {
    cy.get('.tiptap p:first').should('have.class', 'has-focus')
  })
})
