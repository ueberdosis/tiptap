context('insertHTML', () => {
  before(() => {
    cy.visit('/demos/Examples/default')
  })

  it('returns true for the insertHTML command', () => {
    cy.get('.ProseMirror').then(([{ editor }]) => {
      editor.commands.setContent('<p>Example Text</p>')

      const command = editor.commands.insertHTML('<p>Cindy Lauper</p>')

      expect(command).to.be.eq(true)
    })
  })

  it('appends the content when using the insertHTML command', () => {
    cy.get('.ProseMirror').then(([{ editor }]) => {
      editor.commands.setContent('<p>Example Text</p>')

      editor.commands.insertHTML('<p>Cindy Lauper</p>')

      expect(editor.getHTML()).to.be.eq('<p>Example Text</p><p>Cindy Lauper</p>')
    })
  })
})
