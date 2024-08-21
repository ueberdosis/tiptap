context('/src/Extensions/TypographyWithOverrides/Vue/', () => {
  before(() => {
    cy.visit('/src/Extensions/TypographyWithOverrides/Vue/')
  })

  beforeEach(() => {
    cy.resetEditor()
  })

  it('should use correct override for rightArrow', () => {
    cy.get('.tiptap').realType('-> Hello!')
    cy.get('.tiptap').should('contain', '=====> Hello!')
  })
})
