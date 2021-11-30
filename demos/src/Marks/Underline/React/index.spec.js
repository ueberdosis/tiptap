context('/src/Marks/Underline/React/', () => {
  before(() => {
    cy.visit('/src/Marks/Underline/React/')
  })

  beforeEach(() => {
    cy.get('.ProseMirror').then(([{ editor }]) => {
      editor.commands.setContent('<p>Example Text</p>')
      cy.get('.ProseMirror').type('{selectall}')
    })
  })

  it('should parse u tags correctly', () => {
    cy.get('.ProseMirror').then(([{ editor }]) => {
      editor.commands.setContent('<p><u>Example Text</u></p>')
      expect(editor.getHTML()).to.eq('<p><u>Example Text</u></p>')
    })
  })

  it('should transform any tag with text decoration underline to u tags', () => {
    cy.get('.ProseMirror').then(([{ editor }]) => {
      editor.commands.setContent(
        '<p><span style="text-decoration: underline">Example Text</span></p>',
      )
      expect(editor.getHTML()).to.eq('<p><u>Example Text</u></p>')
    })
  })

  it('the button should underline the selected text', () => {
    cy.get('button:first').click()

    cy.get('.ProseMirror').find('u').should('contain', 'Example Text')
  })

  it('the button should toggle the selected text underline', () => {
    cy.get('button:first').click()

    cy.get('.ProseMirror').type('{selectall}')

    cy.get('button:first').click()

    cy.get('.ProseMirror').find('u').should('not.exist')
  })

  it('should underline the selected text when the keyboard shortcut is pressed', () => {
    cy.get('.ProseMirror')
      .trigger('keydown', { modKey: true, key: 'u' })
      .find('u')
      .should('contain', 'Example Text')
  })

  it('should toggle the selected text underline when the keyboard shortcut is pressed', () => {
    cy.get('.ProseMirror')
      .trigger('keydown', { modKey: true, key: 'u' })
      .trigger('keydown', { modKey: true, key: 'u' })
      .find('u')
      .should('not.exist')
  })
})
