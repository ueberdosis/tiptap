context('/src/Marks/Code/Vue/', () => {
  before(() => {
    cy.visit('/src/Marks/Code/Vue/')
  })

  beforeEach(() => {
    cy.get('.tiptap').then(([{ editor }]) => {
      editor.commands.setContent('<p>Example Text</p>')
      cy.get('.tiptap').type('{selectall}')
    })
  })

  it('should parse code tags correctly', () => {
    cy.get('.tiptap').then(([{ editor }]) => {
      editor.commands.setContent('<p><code>Example Text</code></p>')
      expect(editor.getHTML()).to.eq('<p><code>Example Text</code></p>')

      editor.commands.setContent('<code>Example Text</code>')
      expect(editor.getHTML()).to.eq('<p><code>Example Text</code></p>')
    })
  })

  it('should mark the selected text as inline code', () => {
    cy.get('button:first')
      .click()

    cy.get('.tiptap')
      .find('code')
      .should('contain', 'Example Text')
  })

  it('should toggle the selected text as inline code', () => {
    cy.get('button:first')
      .click()

    cy.get('.tiptap')
      .type('{selectall}')

    cy.get('button:first')
      .click()

    cy.get('.tiptap code')
      .should('not.exist')
  })

  it('should make the selected text bold when the keyboard shortcut is pressed', () => {
    cy.get('.tiptap')
      .trigger('keydown', { modKey: true, key: 'e' })
      .find('code')
      .should('contain', 'Example Text')
  })

  it('should toggle the selected text bold when the keyboard shortcut is pressed', () => {
    cy.get('.tiptap')
      .trigger('keydown', { modKey: true, key: 'e' })
      .find('code')
      .should('contain', 'Example Text')

    cy.get('.tiptap')
      .trigger('keydown', { modKey: true, key: 'e' })

    cy.get('.tiptap code').should('not.exist')
  })

  it('should make inline code from the markdown shortcut', () => {
    cy.get('.tiptap')
      .type('`Example`')
      .find('code')
      .should('contain', 'Example')
  })
})
