context('/src/Examples/CustomDocument/Vue/', () => {
  beforeEach(() => {
    cy.visit('/src/Examples/CustomDocument/Vue/')
  })

  it('should have a working tiptap instance', () => {
    cy.get('.tiptap').then(([{ editor }]) => {
      // eslint-disable-next-line
      expect(editor).to.not.be.null
    })
  })

  it('should have a headline and a paragraph', () => {
    cy.get('.tiptap h1').should('exist').should('have.text', 'It’ll always have a heading …')
    cy.get('.tiptap p').should('exist').should('have.text', '… if you pass a custom document. That’s the beauty of having full control over the schema.')
  })

  it('should have a tooltip for a paragraph on a new line', () => {
    cy.get('.tiptap').type('{enter}')
    cy.get('.tiptap p[data-placeholder]').should('exist').should('have.attr', 'data-placeholder', 'Can you add some further context?')
  })

  it('should have a headline after clearing the document', () => {
    cy.get('.tiptap').type('{selectall}{backspace}')
    cy.wait(100)
    cy.get('.tiptap').focus()
    cy.get('.tiptap h1[data-placeholder]')
      .should('exist')
      .should('have.attr', 'class', 'is-empty is-editor-empty')
      .should('have.attr', 'data-placeholder', 'What’s the title?')
  })

  it('should have a headline after clearing the document & enter paragraph automatically after adding a headline', () => {
    cy.get('.tiptap').type('{selectall}{backspace}Hello world{enter}')
    cy.wait(100)
    cy.get('.tiptap h1')
      .should('exist')
      .should('have.text', 'Hello world')
    cy.get('.tiptap p[data-placeholder]')
      .should('exist')
      .should('have.attr', 'data-placeholder', 'Can you add some further context?')

    cy.get('.tiptap').type('This is a paragraph for this test document')
    cy.get('.tiptap p')
      .should('exist')
      .should('have.text', 'This is a paragraph for this test document')
  })
})
