context('/src/Experiments/IsolatingClear/React/', () => {
  beforeEach(() => {
    cy.visit('/src/Experiments/IsolatingClear/React/')
  })

  beforeEach(() => {
    cy.get('.tiptap').then(([{ editor }]) => {
      editor.commands.setContent('<h1>Example Text</h1>')
      cy.get('.tiptap').type('{selectall}')
    })
  })

  it('should apply the paragraph style when the keyboard shortcut is pressed', () => {
    cy.get('.tiptap h1').should('exist')

    cy.get('.tiptap')
      .trigger('keydown', { modKey: true, altKey: true, key: '0' })
      .find('p')
      .should('contain', 'Example Text')
  })
})
