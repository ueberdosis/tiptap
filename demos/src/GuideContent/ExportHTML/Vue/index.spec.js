context('/src/GuideContent/ExportHTML/Vue/', () => {
  before(() => {
    cy.visit('/src/GuideContent/ExportHTML/Vue/')
  })

  beforeEach(() => {
    cy.get('.ProseMirror').then(([{ editor }]) => {
      editor.commands.setContent('<p>Example Text</p>')
    })
  })

  it('should return html', () => {
    cy.get('.ProseMirror').then(([{ editor }]) => {
      const html = editor.getHTML()

      expect(html).to.equal('<p>Example Text</p>')
    })
  })
})
