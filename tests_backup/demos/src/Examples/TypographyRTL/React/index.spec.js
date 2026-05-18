context('/src/Examples/TypographyRTL/React/', () => {
  beforeEach(() => {
    cy.visit('/src/Examples/TypographyRTL/React/')
  })

  describe('Automatic RTL detection', () => {
    beforeEach(() => {
      cy.get('.editor-auto .tiptap').then(([{ editor }]) => {
        editor.commands.clearContent()
      })
    })

    it('should use RTL double quotes when textDirection is rtl', () => {
      cy.get('.editor-auto .tiptap').type('"hello"').should('contain', '”hello“')
    })

    it('should use RTL single quotes when textDirection is rtl', () => {
      cy.get('.editor-auto .tiptap').type("'world'").should('contain', '’world‘')
    })
  })

  describe('Explicit RTL configuration', () => {
    beforeEach(() => {
      cy.get('.editor-explicit .tiptap').then(([{ editor }]) => {
        editor.commands.clearContent()
      })
    })

    it('should use RTL double quotes when configured', () => {
      cy.get('.editor-explicit .tiptap').type('"hello"').should('contain', '”hello“')
    })

    it('should use RTL single quotes when configured', () => {
      cy.get('.editor-explicit .tiptap').type("'world'").should('contain', '’world‘')
    })
  })
})
