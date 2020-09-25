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

  it('the button should add a link to the selected text', () => {
    cy.window().then(win => {
      cy.stub(win, 'prompt').returns('https://tiptap.dev')

      cy.get('.demo__preview button:first')
        .click()

      cy.get('.ProseMirror')
        .find('a')
        .should('contain', 'Example Text')
        .should('have.attr', 'href', 'https://tiptap.dev')
    })
  })

  it.skip('links should be auto detected', () => {
    cy.get('.ProseMirror')
      .then($span => {
        $span.text('https://example.com')
      })
      .find('a')
      .should('contain', 'https://example.com')
      .should('have.attr', 'href', 'https://example.com')
  })
})
