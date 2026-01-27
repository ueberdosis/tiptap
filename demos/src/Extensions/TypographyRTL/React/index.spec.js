context('/src/Extensions/TypographyRTL/React/', () => {
  beforeEach(() => {
    cy.visit('/src/Extensions/TypographyRTL/React/')
  })

  beforeEach(() => {
    cy.get('.tiptap').then(([{ editor }]) => {
      editor.commands.clearContent()
    })
  })

  it('should use RTL double quotes when configured', () => {
    cy.get('.tiptap').type('"hello"').should('contain', '"hello"')
  })

  it('should use RTL single quotes when configured', () => {
    cy.get('.tiptap').type("'world'").should('contain', '’world‘')
  })
})
