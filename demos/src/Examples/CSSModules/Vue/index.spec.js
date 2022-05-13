context('/src/Examples/CSSModules/Vue/', () => {
  before(() => {
    cy.visit('/src/Examples/CSSModules/Vue/')
  })

  beforeEach(() => {
    cy.get('.ProseMirror').then(([{ editor }]) => {
      editor.commands.setContent('<h1>Example Text</h1>')
      cy.get('.ProseMirror').type('{selectall}')
    })
  })

  it('should apply a red headline style to h1', () => {
    cy.get('.ProseMirror h1').should('exist')
    cy.get('.ProseMirror h1').should('have.css', 'color', 'rgb(255, 0, 0)')
  })
})
