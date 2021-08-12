context('/demos/Extensions/History', () => {
  beforeEach(() => {
    cy.visit('/demos/Extensions/History')
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

  it('should make the last change undone with the keyboard shortcut', () => {
    cy.get('.ProseMirror')
      .trigger('keydown', { modKey: true, key: 'z' })

    cy.get('.ProseMirror')
      .should('not.contain', 'Mistake')
  })

  it('should make the last change undone with the keyboard shortcut (russian)', () => {
    cy.get('.ProseMirror')
      .should('contain', 'Mistake')

    cy.get('.ProseMirror')
      .trigger('keydown', { modKey: true, key: 'я' })

    cy.get('.ProseMirror')
      .should('not.contain', 'Mistake')
  })

  it('should apply the last undone change again with the keyboard shortcut', () => {
    cy.get('.ProseMirror')
      .trigger('keydown', { modKey: true, key: 'z' })

    cy.get('.ProseMirror')
      .should('not.contain', 'Mistake')

    cy.get('.ProseMirror')
      .trigger('keydown', { modKey: true, shiftKey: true, key: 'z' })

    cy.get('.ProseMirror')
      .should('contain', 'Mistake')
  })

  it('should apply the last undone change again with the keyboard shortcut (russian)', () => {
    cy.get('.ProseMirror')
      .trigger('keydown', { modKey: true, key: 'я' })

    cy.get('.ProseMirror')
      .should('not.contain', 'Mistake')

    cy.get('.ProseMirror')
      .trigger('keydown', { modKey: true, shiftKey: true, key: 'я' })

    cy.get('.ProseMirror')
      .should('contain', 'Mistake')
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

  it('should disable undo button when there are no more changes to undo', () => {
    cy.get('.ProseMirror')
      .should('contain', 'Mistake')

    cy.get('button:first')
      .should('not.have.attr', 'disabled')

    cy.get('button:first')
      .click()

    cy.get('button:first')
      .should('have.attr', 'disabled')
  })

  it('should disable redo button when there are no more changes to redo', () => {
    cy.get('.ProseMirror')
      .should('contain', 'Mistake')

    cy.get('button:nth-child(2)')
      .should('have.attr', 'disabled')

    cy.get('button:first')
      .click()

    cy.get('button:nth-child(2)')
      .should('not.have.attr', 'disabled')
  })
})
