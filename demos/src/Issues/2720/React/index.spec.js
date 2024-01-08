context('/src/Issues/2720/React/', () => {
  before(() => {
    cy.visit('/src/Issues/2720/React/')
  })

  beforeEach(() => {
    cy.get('.tiptap').type('{selectall}{backspace}')
  })

  it('should insert html content correctly', () => {
    cy.get('button[data-test-id="html-content"]').click()

    // check if the content html is correct
    cy.get('.tiptap').should('contain.html', '<h1>Tiptap</h1><p><strong>Hello World</strong></p><p>This is a paragraph<br>with a break.</p><p>And this is some additional string content.</p>')
  })

  it('should insert text content correctly', () => {
    cy.get('button[data-test-id="text-content"]').click()

    // check if the content html is correct
    cy.get('.tiptap').should('contain.html', 'Hello World\nThis is content with a new line. Is this working?\n\nLets see if multiple new lines are inserted correctly')
  })
})
