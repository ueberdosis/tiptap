context('/src/Extensions/Typography/Vue/', () => {
  before(() => {
    cy.visit('/src/Extensions/Typography/Vue/')
  })

  beforeEach(() => {
    cy.get('.tiptap').then(([{ editor }]) => {
      editor.commands.clearContent()
    })
  })

  it('should make an em dash from two dashes', () => {
    cy.get('.tiptap')
      .type('-- emDash')
      .should('contain', '— emDash')
  })

  it('should make an ellipsis from three dots', () => {
    cy.get('.tiptap')
      .type('... ellipsis')
      .should('contain', '… ellipsis')
  })

  it('should make a correct open double quote', () => {
    cy.get('.tiptap')
      .type('"openDoubleQuote"')
      .should('contain', '“openDoubleQuote')
  })

  it('should make a correct close double quote', () => {
    cy.get('.tiptap')
      .type('"closeDoubleQuote"')
      .should('contain', 'closeDoubleQuote”')
  })

  it('should make a correct open single quote', () => {
    cy.get('.tiptap')
      .type("'openSingleQuote'")
      .should('contain', '‘openSingleQuote’')
  })

  it('should make a correct close single quote', () => {
    cy.get('.tiptap')
      .type("'closeSingleQuote'")
      .should('contain', 'closeSingleQuote’')
  })

  it('should make a left arrow', () => {
    cy.get('.tiptap')
      .type('<- leftArrow')
      .should('contain', '← leftArrow')
  })

  it('should make a right arrow', () => {
    cy.get('.tiptap')
      .type('-> rightArrow')
      .should('contain', '→ rightArrow')
  })

  it('should make a copyright sign', () => {
    cy.get('.tiptap')
      .type('(c) copyright')
      .should('contain', '© copyright')
  })

  it('should make a registered trademark sign', () => {
    cy.get('.tiptap')
      .type('(r) registeredTrademark')
      .should('contain', '® registeredTrademark')
  })

  it('should make a trademark sign', () => {
    cy.get('.tiptap')
      .type('(tm) trademark')
      .should('contain', '™ trademark')
  })

  it('should make a one half', () => {
    cy.get('.tiptap')
      .type('1/2 oneHalf')
      .should('contain', '½ oneHalf')
  })

  it('should make a plus/minus sign', () => {
    cy.get('.tiptap')
      .type('+/- plusMinus')
      .should('contain', '± plusMinus')
  })

  it('should make a not equal sign', () => {
    cy.get('.tiptap')
      .type('!= notEqual')
      .should('contain', '≠ notEqual')
  })

  it('should make a laquo', () => {
    cy.get('.tiptap')
      .type('<< laquorow')
      .should('contain', '« laquo')
  })

  it('should make a raquo', () => {
    cy.get('.tiptap')
      .type('>> raquorow')
      .should('contain', '» raquo')
  })

  it('should make a multiplication sign from an asterisk', () => {
    cy.get('.tiptap')
      .type('1*1 multiplication')
      .should('contain', '1×1 multiplication')
  })

  it('should make a multiplication sign from an x', () => {
    cy.get('.tiptap')
      .type('1x1 multiplication')
      .should('contain', '1×1 multiplication')
  })

  it('should make a multiplication sign from an asterisk with spaces', () => {
    cy.get('.tiptap')
      .type('1 * 1 multiplication')
      .should('contain', '1 × 1 multiplication')
  })

  it('should make a multiplication sign from an x with spaces', () => {
    cy.get('.tiptap')
      .type('1 x 1 multiplication')
      .should('contain', '1 × 1 multiplication')
  })
})
