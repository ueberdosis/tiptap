context('/src/Extensions/Focus/React/', () => {
  before(() => {
    cy.visit('/src/Extensions/Focus/React/')
  })

  it('should have class', () => {
    cy.get('.tiptap p:first').should('have.class', 'has-focus')
  })
})
