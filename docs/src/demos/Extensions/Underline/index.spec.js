context('/api/extensions/underline', () => {
  before(() => {
    cy.visit('/api/extensions/underline')
  })

  beforeEach(() => {
    cy.get('.ProseMirror').then(([{ editor }]) => {
      editor.setContent('<p>Example Text</p>')
      editor.selectAll()
    })
  })

  it('should parse u tags correctly', () => {
    cy.get('.ProseMirror').then(([{ editor }]) => {
      editor.setContent('<p><u>Example Text</u></p>')
      expect(editor.getHTML()).to.eq('<p><u>Example Text</u></p>')
    })
  })

  it('should transform any tag with text decoration underline to u tags', () => {
    cy.get('.ProseMirror').then(([{ editor }]) => {
      editor.setContent('<p><span style="text-decoration: underline">Example Text</span></p>')
      expect(editor.getHTML()).to.eq('<p><u>Example Text</u></p>')
    })
  })

  it('the button should underline the selected text', () => {
    cy.get('.demo__preview button:first')
      .click()

    cy.get('.ProseMirror')
      .find('u')
      .should('contain', 'Example Text')
  })

  it('the button should toggle the selected text underline', () => {
    cy.get('.demo__preview button:first')
      .click()

    cy.get('.ProseMirror')
      .type('{selectall}')

    cy.get('.demo__preview button:first')
      .click()

    cy.get('.ProseMirror')
      .find('u')
      .should('not.exist')
  })

  it('the keyboard shortcut should underline the selected text', () => {
    cy.get('.ProseMirror')
      .trigger('keydown', { modKey: true, key: 'u' })
      .find('u')
      .should('contain', 'Example Text')
  })

  it('the keyboard shortcut should toggle the selected text underline', () => {
    cy.get('.ProseMirror')
      .trigger('keydown', { modKey: true, key: 'u' })
      .trigger('keydown', { modKey: true, key: 'u' })
      .find('u')
      .should('not.exist')
  })
})
