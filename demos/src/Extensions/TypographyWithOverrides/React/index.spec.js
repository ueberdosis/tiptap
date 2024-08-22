context('/src/Extensions/TypographyWithOverrides/React/', () => {
  before(() => {
    cy.visit('/src/Extensions/TypographyWithOverrides/React/')
  })

  beforeEach(() => {
    cy.resetEditor()
  })

  it('should use correct override for rightArrow', () => {
    cy.get('.tiptap').realType('-> Hello!')
    cy.get('.tiptap').should('contain', '=====> Hello!')
  })
})
