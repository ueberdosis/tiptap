context('/src/GuideContent/ReadOnly/React/', () => {
  before(() => {
    cy.visit('/src/GuideContent/ReadOnly/React/')
  })

  beforeEach(() => {
    cy.get('.tiptap').then(([{ editor }]) => {
      editor.commands.clearContent()
    })
  })

  it('should be read-only', () => {
    cy.get('.tiptap').then(([{ editor }]) => {
      editor.setEditable(false)
      cy.get('.tiptap').type('Edited: ')

      cy.get('.tiptap p:first').should('not.contain', 'Edited: ')

      cy
        .get('.tiptap')
        .invoke('attr', 'tabindex')
        .should('not.exist')
    })
  })

  it('should be editable', () => {
    cy.get('.tiptap').then(([{ editor }]) => {
      editor.setEditable(true)
      cy.get('.tiptap').type('Edited: ')

      cy.get('.tiptap p:first').should('contain', 'Edited: ')

      cy
        .get('.tiptap')
        .invoke('attr', 'tabindex')
        .should('eq', '0')
    })
  })
})
