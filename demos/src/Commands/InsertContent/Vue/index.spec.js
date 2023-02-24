context('/src/Commands/InsertContent/Vue/', () => {
  before(() => {
    cy.visit('/src/Commands/InsertContent/Vue/')
  })

  beforeEach(() => {
    cy.get('.ProseMirror').then(([{ editor }]) => {
      editor.commands.clearContent()
    })
  })
})
