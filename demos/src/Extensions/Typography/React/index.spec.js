context('/src/Extensions/Typography/React/', () => {
  before(() => {
    cy.visit('/src/Extensions/Typography/React/')
  })

  beforeEach(() => {
    cy.resetEditor()
  })

  it('should keep dates as they are', () => {
    cy.get('.tiptap').realType('1/4/2024')
    cy.get('.tiptap').should('contain', '1/4/2024')
  })

  it('should make a fraction only with spaces afterwards', () => {
    cy.get('.tiptap').realType('1/4')
    cy.get('.tiptap').should('contain', '1/4')

    cy.get('.tiptap').type('{selectall}{backspace}')

    cy.get('.tiptap').realType('1/4 ')
    cy.get('.tiptap').should('contain', '¼')
  })

  it('should make an em dash from two dashes', () => {
    cy.get('.tiptap').realType('-- emDash')
    cy.get('.tiptap').should('contain', '— emDash')
  })

  it('should make an ellipsis from three dots', () => {
    cy.get('.tiptap').realType('... ellipsis')
    cy.get('.tiptap').should('contain', '… ellipsis')
  })

  it('should make a correct open double quote', () => {
    cy.get('.tiptap').realType('"openDoubleQuote"')
    cy.get('.tiptap').should('contain', '“openDoubleQuote')
  })

  it('should make a correct close double quote', () => {
    cy.get('.tiptap').realType('"closeDoubleQuote"')
    cy.get('.tiptap').should('contain', 'closeDoubleQuote”')
  })

  it('should make a correct open single quote', () => {
    cy.get('.tiptap').realType("'openSingleQuote'")
    cy.get('.tiptap').should('contain', '‘openSingleQuote’')
  })

  it('should make a correct close single quote', () => {
    cy.get('.tiptap').realType("'closeSingleQuote'")
    cy.get('.tiptap').should('contain', 'closeSingleQuote’')
  })

  it('should make a left arrow', () => {
    cy.get('.tiptap').realType('<- leftArrow')
    cy.get('.tiptap').should('contain', '← leftArrow')
  })

  it('should make a right arrow', () => {
    cy.get('.tiptap').realType('-> rightArrow')
    cy.get('.tiptap').should('contain', '→ rightArrow')
  })

  it('should make a copyright sign', () => {
    cy.get('.tiptap').realType('(c) copyright')
    cy.get('.tiptap').should('contain', '© copyright')
  })

  it('should make a registered trademark sign', () => {
    cy.get('.tiptap').realType('(r) registeredTrademark')
    cy.get('.tiptap').should('contain', '® registeredTrademark')
  })

  it('should make a trademark sign', () => {
    cy.get('.tiptap').realType('(tm) trademark')
    cy.get('.tiptap').should('contain', '™ trademark')
  })

  it('should make a one half', () => {
    cy.get('.tiptap').realType('1/2 oneHalf')
    cy.get('.tiptap').should('contain', '½ oneHalf')
  })

  it('should make a plus/minus sign', () => {
    cy.get('.tiptap').realType('+/- plusMinus')
    cy.get('.tiptap').should('contain', '± plusMinus')
  })

  it('should make a not equal sign', () => {
    cy.get('.tiptap').realType('!= notEqual')
    cy.get('.tiptap').should('contain', '≠ notEqual')
  })

  it('should make a laquo', () => {
    cy.get('.tiptap').realType('<< laquorow')
    cy.get('.tiptap').should('contain', '« laquo')
  })

  it('should make a raquo', () => {
    cy.get('.tiptap').realType('>> raquorow')
    cy.get('.tiptap').should('contain', '» raquo')
  })

  it('should make a multiplication sign from an asterisk', () => {
    cy.get('.tiptap').realType('1*1 multiplication')
    cy.get('.tiptap').should('contain', '1×1 multiplication')
  })

  it('should make a multiplication sign from an x', () => {
    cy.get('.tiptap').realType('1x1 multiplication')
    cy.get('.tiptap').should('contain', '1×1 multiplication')
  })

  it('should make a multiplication sign from an asterisk with spaces', () => {
    cy.get('.tiptap').realType('1 * 1 multiplication')
    cy.get('.tiptap').should('contain', '1 × 1 multiplication')
  })

  it('should make a multiplication sign from an x with spaces', () => {
    cy.get('.tiptap').realType('1 x 1 multiplication')
    cy.get('.tiptap').should('contain', '1 × 1 multiplication')
  })
})
