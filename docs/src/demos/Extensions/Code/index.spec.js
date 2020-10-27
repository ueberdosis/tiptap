context('/api/extensions/code', () => {
  before(() => {
    cy.visit('/api/extensions/code')
  })

  beforeEach(() => {
    cy.get('.ProseMirror').then(([{ editor }]) => {
      editor.setContent('<p>Example Text</p>')
      editor.selectAll()
    })
  })

  it('should parse code tags correctly', () => {
    cy.get('.ProseMirror').then(([{ editor }]) => {
      editor.setContent('<p><code>Example Text</code></p>')
      expect(editor.getHTML()).to.eq('<p><code>Example Text</code></p>')

      editor.setContent('<code>Example Text</code>')
      expect(editor.getHTML()).to.eq('<p><code>Example Text</code></p>')
    })
  })

  it('should mark the selected text as inline code', () => {
    cy.get('.demo__preview button:first')
      .click()

    cy.get('.ProseMirror')
      .find('code')
      .should('contain', 'Example Text')
  })

  it('should toggle the selected text as inline code', () => {
    cy.get('.demo__preview button:first')
      .click()

    cy.get('.ProseMirror')
      .type('{selectall}')

    cy.get('.demo__preview button:first')
      .click()

    cy.get('.ProseMirror code')
      .should('not.exist')
  })

  it('should make inline code from the markdown shortcut', () => {
    cy.get('.ProseMirror')
      .type('`Example`')
      .find('code')
      .should('contain', 'Example')
  })
})
