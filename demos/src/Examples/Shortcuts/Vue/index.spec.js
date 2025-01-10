context('/src/Examples/Shortcuts/Vue/', () => {
  before(() => {
    cy.visit('/src/Examples/Shortcuts/Vue/')
  })

  beforeEach(() => {
    cy.get('.tiptap').then(([{ editor }]) => {
      editor.commands.setContent('<p>Example Text</p>')
    })
  })

  it('should update the hint html when the keyboard shortcut is pressed', () => {
    cy.get('.tiptap')
      .trigger('keydown', { modKey: true, altKey: true, key: 'Enter' })
    cy.get('.hint')
      .should('contain', 'Meta-Enter was the last shortcut')
  })

  it('should update the hint html when the keyboard shortcut is pressed', () => {
    cy.get('.tiptap')
      .trigger('keydown', { shiftKey: true, altKey: true, key: 'Enter' })
    cy.get('.hint')
      .should('contain', 'Shift-Enter was the last shortcut')
  })
})
