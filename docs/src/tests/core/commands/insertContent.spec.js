context('insertContent', () => {
  before(() => {
    cy.visit('/demos/Examples/Default/Vue')
  })

  it('returns true for the insertContent command', () => {
    cy.get('.ProseMirror').then(([{ editor }]) => {
      editor.commands.setContent('<p>Example Text</p>')

      const command = editor.commands.insertContent('<p>Cindy Lauper</p>')

      expect(command).to.be.eq(true)
    })
  })

  it('appends the content when using the insertContent command', () => {
    cy.get('.ProseMirror').then(([{ editor }]) => {
      editor.commands.setContent('<p>Example Text</p>')

      editor.commands.insertContent('<p>Cindy Lauper</p>')

      expect(editor.getHTML()).to.be.eq('<p>Example Text</p><p>Cindy Lauper</p>')
    })
  })
})
