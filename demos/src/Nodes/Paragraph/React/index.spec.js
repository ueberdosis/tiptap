context('/src/Nodes/Paragraph/React/', () => {
  before(() => {
    cy.visit('/src/Nodes/Paragraph/React/')
  })

  beforeEach(() => {
    cy.get('.ProseMirror').then(([{ editor }]) => {
      editor.commands.clearContent()
    })
  })

  it('should parse paragraphs correctly', () => {
    cy.get('.ProseMirror').then(([{ editor }]) => {
      editor.commands.setContent('<p>Example Text</p>')
      expect(editor.getHTML()).to.eq('<p>Example Text</p>')

      editor.commands.setContent('<p><x-unknown>Example Text</x-unknown></p>')
      expect(editor.getHTML()).to.eq('<p>Example Text</p>')

      editor.commands.setContent('<p style="display: block;">Example Text</p>')
      expect(editor.getHTML()).to.eq('<p>Example Text</p>')
    })
  })

  it('text should be wrapped in a paragraph by default', () => {
    cy.get('.ProseMirror').type('Example Text').find('p').should('contain', 'Example Text')
  })

  it('enter should make a new paragraph', () => {
    cy.get('.ProseMirror')
      .type('First Paragraph{enter}Second Paragraph')
      .find('p')
      .should('have.length', 2)

    cy.get('.ProseMirror').find('p:first').should('contain', 'First Paragraph')

    cy.get('.ProseMirror').find('p:nth-child(2)').should('contain', 'Second Paragraph')
  })

  it('backspace should remove the second paragraph', () => {
    cy.get('.ProseMirror').type('{enter}').find('p').should('have.length', 2)

    cy.get('.ProseMirror').type('{backspace}').find('p').should('have.length', 1)
  })
})
