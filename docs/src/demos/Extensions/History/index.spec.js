context('/demos/Extensions/History', () => {
  before(() => {
    cy.visit('/demos/Extensions/History')
  })

  beforeEach(() => {
    cy.get('.ProseMirror').then(([{ editor }]) => {
      editor.commands.setContent('<p>Mistake</p>')
    })
  })

  it('should make the last change undone', () => {
    cy.get('.ProseMirror')
      .should('contain', 'Mistake')

    cy.get('button:first')
      .click()

    cy.get('.ProseMirror')
      .should('not.contain', 'Mistake')
  })

  it('the keyboard shortcut should make the last change undone', () => {
    cy.get('.ProseMirror')
      .trigger('keydown', { modKey: true, key: 'z' })
      .should('not.contain', 'Mistake')
  })

  it('should apply the last undone change again', () => {
    cy.get('.ProseMirror')
      .should('contain', 'Mistake')

    cy.get('button:first')
      .click()

    cy.get('.ProseMirror')
      .should('not.contain', 'Mistake')

    cy.get('button:nth-child(2)')
      .click()

    cy.get('.ProseMirror')
      .should('contain', 'Mistake')
  })

  it.skip('the keyboard shortcut should apply the last undone change again', () => {
    cy.get('.ProseMirror')
      .trigger('keydown', { modKey: true, key: 'z' })
      .should('not.contain', 'Mistake')
      .trigger('keydown', { modKey: true, shiftKey: true, key: 'z' })
      .should('contain', 'Mistake')
  })
})
