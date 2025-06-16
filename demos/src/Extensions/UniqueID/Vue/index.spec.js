context('/src/Extensions/UniqueID/Vue/', () => {
  before(() => {
    cy.visit('/src/Extensions/UniqueID/Vue/')
  })

  it('has a heading with an unique ID', () => {
    cy.get('.ProseMirror h1').should('have.attr', 'data-id')
  })

  it('has a paragraph with an unique ID', () => {
    cy.get('.ProseMirror p').should('have.attr', 'data-id')
  })
})
