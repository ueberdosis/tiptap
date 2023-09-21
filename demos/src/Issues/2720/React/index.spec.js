context('/src/Issues/2720/React/', () => {
  before(() => {
    cy.visit('/src/Issues/2720/React/')
  })

  beforeEach(() => {
    cy.get('.tiptap').type('{selectall}{backspace}')
  })

  it('should insert html content correctly', () => {
    cy.get('button[testId="html-content"]').click()

    // check if the content html is correct
    cy.get('.tiptap').should('contain.html', '<h1>Tiptap</h1><p><strong>Hello World</strong></p>')
  })

  it('should insert text content correctly', () => {
    cy.get('button[testId="text-content"]').click()

    // check if the content html is correct
    cy.get('.tiptap').should('contain.html', 'Hello World\nThis is content with a new line. Is this working?\n\nLets see if multiple new lines are inserted correctly')
  })
})
