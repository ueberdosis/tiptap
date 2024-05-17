context('/src/Extensions/TypographyWithOverrides/React/', () => {
  before(() => {
    cy.visit('/src/Extensions/TypographyWithOverrides/React/')
  })

  beforeEach(() => {
    cy.get('.tiptap').then(([{ editor }]) => {
      editor.commands.clearContent()
    })
  })

  it('should use correct override for rightArrow', () => {
    cy.get('.tiptap').type('-> Hello!').should('contain', '=====> Hello!')
  })
})
