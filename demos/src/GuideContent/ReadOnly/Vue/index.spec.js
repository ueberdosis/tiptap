context('/src/GuideContent/ReadOnly/Vue/', () => {
  beforeEach(() => {
    cy.visit('/src/GuideContent/ReadOnly/Vue/')
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
    })
  })

  it('should be editable', () => {
    cy.get('#editable').click()
    cy.get('.tiptap').then(() => {
      cy.get('.tiptap').type('Edited: ')

      cy.get('.tiptap p:first').should('contain', 'Edited: ')
    })
  })
})
