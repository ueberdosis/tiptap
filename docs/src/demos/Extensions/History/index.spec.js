context('/api/extensions/history', () => {
  beforeEach(() => {
    cy.visit('/api/extensions/history')

    cy.get('.ProseMirror').window().then(window => {
      const { editor } = window
      editor.setContent('<p>Mistake</p>')
    })
  })

  it('should make the last change undone', () => {
    cy.get('.ProseMirror').window().then(window => {
      cy.get('.ProseMirror').should('contain', 'Mistake')

      cy.get('.demo__preview button:first').click({ force: true })
      cy.get('.ProseMirror').should('not.contain', 'Mistake')
    })
  })

  it('the keyboard shortcut should make the last change undone', () => {
    cy.get('.ProseMirror').type('{meta}z', { force: true })
    cy.get('.ProseMirror').should('not.contain', 'Mistake')
  })

  it('should apply the last undone change again', () => {
    cy.get('.ProseMirror').window().then(window => {
      cy.get('.ProseMirror').should('contain', 'Mistake')

      cy.get('.demo__preview button:first').click({ force: true })
      cy.get('.ProseMirror').should('not.contain', 'Mistake')
      cy.get('.demo__preview button:nth-child(2)').click({ force: true })
      cy.get('.ProseMirror').should('contain', 'Mistake')
    })
  })

  it.skip('the keyboard shortcut should apply the last undone change again', () => {
    cy.get('.ProseMirror').type('{meta}z', { force: true })
    cy.get('.ProseMirror').should('not.contain', 'Mistake')

    cy.get('.ProseMirror').type('{meta}{shift}z', { force: true })
    cy.get('.ProseMirror').should('contain', 'Mistake')
  })
})
