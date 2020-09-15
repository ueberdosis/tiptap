context('/api/extensions/bullet-list', () => {
  before(() => {
    cy.visit('/api/extensions/bullet-list')
  })

  beforeEach(() => {
    cy.get('.ProseMirror').then(([{ editor }]) => {
      editor.setContent('<p>Example Text</p>')
      editor.selectAll()
    })
  })
})