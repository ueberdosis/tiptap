context('/demos/Guide/Content/ReadOnly', () => {
  beforeEach(() => {
    cy.visit('/demos/Guide/Content/ReadOnly')
  })

  it('should be read-only', () => {
    cy.get('.ProseMirror').then(([{ editor }]) => {
      editor.setEditable(false)
      editor.commands.insertContent('Edited: ')

      cy.get('.ProseMirror p:first').should('not.contain', 'Edited: ')
    })
  })

  it('should be editable', () => {
    cy.get('.ProseMirror').then(([{ editor }]) => {
      editor.setEditable(true)
      editor.commands.insertContent('Edited: ')

      cy.get('.ProseMirror p:first').should('contain', 'Edited: ')
    })
  })
})
