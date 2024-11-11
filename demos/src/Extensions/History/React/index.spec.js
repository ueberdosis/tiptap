context('/src/Extensions/History/React/', () => {
  beforeEach(() => {
    cy.visit('/src/Extensions/History/React/')
    cy.get('.tiptap').then(([{ editor }]) => {
      editor.commands.setContent('<p>Mistake</p>')
    })
  })

  it('should make the last change undone', () => {
    cy.get('.tiptap').should('contain', 'Mistake')

    cy.get('button:first').should('not.have.attr', 'disabled')

    cy.get('button:first').click()

    cy.get('.tiptap').should('not.contain', 'Mistake')
  })

  it('should make the last change undone with the keyboard shortcut', () => {
    cy.get('.tiptap').trigger('keydown', { modKey: true, key: 'z' })

    cy.get('.tiptap').should('not.contain', 'Mistake')
  })

  it('should make the last change undone with the keyboard shortcut (russian)', () => {
    cy.get('.tiptap').should('contain', 'Mistake')

    cy.get('.tiptap').trigger('keydown', { modKey: true, key: 'я' })

    cy.get('.tiptap').should('not.contain', 'Mistake')
  })

  it('should apply the last undone change again with the keyboard shortcut', () => {
    cy.get('.tiptap').trigger('keydown', { modKey: true, key: 'z' })

    cy.get('.tiptap').should('not.contain', 'Mistake')

    cy.get('.tiptap').trigger('keydown', { modKey: true, shiftKey: true, key: 'z' })

    cy.get('.tiptap').should('contain', 'Mistake')
  })

  it('should apply the last undone change again with the keyboard shortcut (russian)', () => {
    cy.get('.tiptap').trigger('keydown', { modKey: true, key: 'я' })

    cy.get('.tiptap').should('not.contain', 'Mistake')

    cy.get('.tiptap').trigger('keydown', { modKey: true, shiftKey: true, key: 'я' })

    cy.get('.tiptap').should('contain', 'Mistake')
  })

  it('should apply the last undone change again', () => {
    cy.get('.tiptap').should('contain', 'Mistake')

    cy.get('button:first').should('not.have.attr', 'disabled')

    cy.get('button:first').click()

    cy.get('.tiptap').should('not.contain', 'Mistake')

    cy.get('button:first').should('have.attr', 'disabled')

    cy.get('button:nth-child(2)').click()

    cy.get('.tiptap').should('contain', 'Mistake')
  })

  it('should disable undo button when there are no more changes to undo', () => {
    cy.get('.tiptap').should('contain', 'Mistake')

    cy.get('button:first').should('not.have.attr', 'disabled')

    cy.get('button:first').click()

    cy.get('button:first').should('have.attr', 'disabled')
  })

  it('should disable redo button when there are no more changes to redo', () => {
    cy.get('.tiptap').should('contain', 'Mistake')

    cy.get('button:nth-child(2)').should('have.attr', 'disabled')

    cy.get('button:first').should('not.have.attr', 'disabled')

    cy.get('button:first').click()

    cy.get('button:nth-child(2)').should('not.have.attr', 'disabled')
  })
})
