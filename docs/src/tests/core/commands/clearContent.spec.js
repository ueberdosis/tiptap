context('clearContent', () => {
  before(() => {
    cy.visit('/demos/Examples/Default/Vue')
  })

  it('returns true for the clearContent command', () => {
    cy.get('.ProseMirror').then(([{ editor }]) => {
      editor.commands.setContent('<p>Example Text</p>')

      const command = editor.commands.clearContent()

      expect(command).to.be.eq(true)
    })
  })

  it('clears the content when using the clearContent command', () => {
    cy.get('.ProseMirror').then(([{ editor }]) => {
      editor.commands.setContent('<p>Example Text</p>')

      editor.commands.clearContent()

      expect(editor.getHTML()).to.be.eq('<p></p>')
    })
  })
})
