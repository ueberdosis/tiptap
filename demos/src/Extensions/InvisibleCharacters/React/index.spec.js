context('/src/Extensions/InvisibleCharacters/React/', () => {
  before(() => {
    cy.visit('/src/Extensions/InvisibleCharacters/React/')
  })

  it('should have invisible characters', () => {
    cy.get('[class*="tiptap-invisible-character"]').should('exist')
  })
})
