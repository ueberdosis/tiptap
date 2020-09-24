context('/examples/history', () => {
  before(() => {
    cy.visit('/examples/history')
  })

  beforeEach(() => {
    cy.get('.ProseMirror').then(([{ editor }]) => {
      editor.clearContent()
    })
  })

  it('should not have a mistake', () => {
    cy.get('.ProseMirror').then(() => {
      cy.get('.ProseMirror').should('not.contain', 'Mistake')
    })
  })

  it('should have a mistake', () => {
    cy.get('.ProseMirror').then(([{ editor }]) => {
      editor.insertText('Mistake')
      cy.get('.ProseMirror').should('contain', 'Mistake')
    })
  })

  it('the mistake should be removed again', () => {
    cy.get('.ProseMirror').then(([{ editor }]) => {
      editor.undo()
      cy.get('.ProseMirror').should('not.contain', 'Mistake')
    })
  })
})
