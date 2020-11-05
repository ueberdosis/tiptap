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
      .find('p')
      .should('contain', '— emDash')
  })

  it('should make an ellipsis from three dots', () => {
    cy.get('.ProseMirror')
      .type('... ellipsis')
      .find('p')
      .should('contain', '… ellipsis')
  })

  it('should make an correct open double quote', () => {
    cy.get('.ProseMirror')
      .type('"openDoubleQuote"')
      .find('p')
      .should('contain', '“openDoubleQuote')
  })

  it('should make an correct close double quote', () => {
    cy.get('.ProseMirror')
      .type('"closeDoubleQuote"')
      .find('p')
      .should('contain', 'closeDoubleQuote”')
  })

  it('should make an correct open single quote', () => {
    cy.get('.ProseMirror')
      .type("'openSingleQuote'")
      .find('p')
      .should('contain', '‘openSingleQuote’')
  })

  it('should make an correct close single quote', () => {
    cy.get('.ProseMirror')
      .type("'closeSingleQuote'")
      .find('p')
      .should('contain', 'closeSingleQuote’')
  })
})
