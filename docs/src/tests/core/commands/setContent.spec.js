context('setContent', () => {
  before(() => {
    cy.visit('/demos/Examples/Default/Vue')
  })

  it('returns true for the setContent command', () => {
    cy.get('.ProseMirror').then(([{ editor }]) => {
      const command = editor.commands.setContent('<p>Example Text</p>')

      expect(command).to.be.eq(true)
    })
  })

  it('clears the content when using the setContent command', () => {
    cy.get('.ProseMirror').then(([{ editor }]) => {
      editor.commands.setContent('<p>Cindy Lauper</p>')

      expect(editor.getHTML()).to.be.eq('<p>Cindy Lauper</p>')
    })
  })
})
