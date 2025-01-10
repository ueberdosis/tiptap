context('/src/Examples/EnterShortcuts/Vue/', () => {
  before(() => {
    cy.visit('/src/Examples/EnterShortcuts/Vue/')
  })

  beforeEach(() => {
    cy.get('.tiptap').then(([{ editor }]) => {
      editor.commands.setContent('<p>Example Text</p>')
    })
  })

  it('should update the hint html when the keyboard shortcut is pressed', () => {
    cy.get('.tiptap')
      .trigger('keydown', { metaKey: true, key: 'Enter' })
    cy.get('.hint')
      .should('contain', 'Meta-Enter was the last shortcut')
  })

  it('should update the hint html when the keyboard shortcut is pressed', () => {
    cy.get('.tiptap')
      .trigger('keydown', { shiftKey: true, key: 'Enter' })
    cy.get('.hint')
      .should('contain', 'Shift-Enter was the last shortcut')
  })

  it('should update the hint html when the keyboard shortcut is pressed', () => {
    cy.get('.tiptap')
      .trigger('keydown', { ctrlKey: true, key: 'Enter' })
    cy.get('.hint')
      .should('contain', 'Ctrl-Enter was the last shortcut')
  })
})
