context('/src/Extensions/UniqueID/React/', () => {
  before(() => {
    cy.visit('/src/Extensions/UniqueID/React/')
  })

  it('has a heading with an unique ID', () => {
    cy.get('.ProseMirror h1').should('have.attr', 'data-id')
  })

  it('has a paragraph with an unique ID', () => {
    cy.get('.ProseMirror p').should('have.attr', 'data-id')
  })
})
