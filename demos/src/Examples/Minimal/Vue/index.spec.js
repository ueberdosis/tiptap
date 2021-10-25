context('/src/Examples/Minimal/Vue/', () => {
  before(() => {
    cy.visit('/src/Examples/Minimal/Vue/')
  })

  beforeEach(() => {
    cy.get('.ProseMirror').then(([{ editor }]) => {
      editor.commands.clearContent()
    })
  })

  it('text should be wrapped in a paragraph by default', () => {
    cy.get('.ProseMirror')
      .type('Example Text')
      .find('p')
      .should('contain', 'Example Text')
  })

  it('should parse paragraphs correctly', () => {
    cy.get('.ProseMirror').then(([{ editor }]) => {
      editor.commands.setContent('<p>Example Text</p>')
      expect(editor.getHTML()).to.eq('<p>Example Text</p>')

      editor.commands.setContent('<p style="color:DodgerBlue;">Example Text</p>')
      expect(editor.getHTML()).to.eq('<p>Example Text</p>')
    })
  })

  it('enter should make a new paragraph', () => {
    cy.get('.ProseMirror')
      .type('First Paragraph{enter}Second Paragraph')
      .find('p')
      .should('have.length', 2)
  })

  it('backspace should remove the last paragraph', () => {
    cy.get('.ProseMirror')
      .type('{enter}')
      .find('p')
      .should('have.length', 2)

    cy.get('.ProseMirror')
      .type('{backspace}')
      .find('p')
      .should('have.length', 1)
  })
})
