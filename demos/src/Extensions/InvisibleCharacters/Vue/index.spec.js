context('/src/Extensions/InvisibleCharacters/Vue/', () => {
  before(() => {
    cy.visit('/src/Extensions/InvisibleCharacters/Vue/')
  })

  it('should have invisible characters', () => {
    cy.get('[class*="tiptap-invisible-character"]').should('exist')
  })
})
