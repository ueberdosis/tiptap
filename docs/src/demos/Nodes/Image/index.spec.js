context('/api/nodes/image', () => {
  before(() => {
    cy.visit('/api/nodes/image')
  })

  beforeEach(() => {
    cy.get('.ProseMirror').then(([{ editor }]) => {
      editor.setContent('<p>Example Text</p>')
      editor.selectAll()
    })
  })

  it('should add an img tag with the correct URL', () => {
    cy.window().then(win => {
      cy.stub(win, 'prompt').returns('foobar.png')

      cy.get('.demo__preview button:first')
        .click()

      cy.window().its('prompt').should('be.called')

      cy.get('.ProseMirror')
        .find('img')
        .should('have.attr', 'src', 'foobar.png')
    })
  })
})
