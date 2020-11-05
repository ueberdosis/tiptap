context('/api/extensions/typography', () => {
  before(() => {
    cy.visit('/api/extensions/typography')
  })

  beforeEach(() => {
    cy.get('.ProseMirror').then(([{ editor }]) => {
      editor.clearContent()
    })
  })

  it('should make an em dash from two dashes', () => {
    cy.get('.ProseMirror')
      .type('-- emDash')
      .should('contain', '— emDash')
  })

  it('should make an ellipsis from three dots', () => {
    cy.get('.ProseMirror')
      .type('... ellipsis')
      .should('contain', '… ellipsis')
  })

  it('should make an correct open double quote', () => {
    cy.get('.ProseMirror')
      .type('"openDoubleQuote"')
      .should('contain', '“openDoubleQuote')
  })

  it('should make an correct close double quote', () => {
    cy.get('.ProseMirror')
      .type('"closeDoubleQuote"')
      .should('contain', 'closeDoubleQuote”')
  })

  it('should make an correct open single quote', () => {
    cy.get('.ProseMirror')
      .type("'openSingleQuote'")
      .should('contain', '‘openSingleQuote’')
  })

  it('should make an correct close single quote', () => {
    cy.get('.ProseMirror')
      .type("'closeSingleQuote'")
      .should('contain', 'closeSingleQuote’')
  })

  it('should make a leftwards arrow', () => {
    cy.get('.ProseMirror')
      .type('<- leftwardsArrow')
      .should('contain', '← leftwardsArrow')
  })

  it('should make a rightwards arrow', () => {
    cy.get('.ProseMirror')
      .type('-> rightwardsArrow')
      .should('contain', '→ rightwardsArrow')
  })
})
