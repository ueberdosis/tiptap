context('/src/Nodes/Image/Vue/', () => {
  before(() => {
    cy.visit('/src/Nodes/Image/Vue/')
  })

  beforeEach(() => {
    cy.get('.tiptap').then(([{ editor }]) => {
      editor.commands.setContent('<p>Example Text</p>')
      cy.get('.tiptap').type('{selectall}')
    })
  })

  it('should add an img tag with the correct URL', () => {
    cy.window().then(win => {
      cy.stub(win, 'prompt').returns('foobar.png')

      cy.get('button:first')
        .click()

      cy.window().its('prompt').should('be.called')

      cy.get('.tiptap')
        .find('img')
        .should('have.attr', 'src', 'foobar.png')
    })
  })
})
