context('/api/extensions/link', () => {
  before(() => {
    cy.visit('/api/extensions/link')
  })

  beforeEach(() => {
    cy.get('.ProseMirror').then(([{ editor }]) => {
      editor.setContent('<p>Example Text</p>')
      editor.selectAll()
    })
  })
})
