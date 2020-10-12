context('/api/extensions/hard-break', () => {
  before(() => {
    cy.visit('/api/extensions/hard-break')
  })

  beforeEach(() => {
    cy.get('.ProseMirror').then(([{ editor }]) => {
      editor.setContent('<p>Example Text</p>')
    })
  })

  it('should parse hard breaks correctly', () => {
    cy.get('.ProseMirror').then(([{ editor }]) => {
      editor.setContent('<p>Example<br>Text</p>')
      expect(editor.html()).to.eq('<p>Example<br>Text</p>')
    })
  })

  it('should parse hard breaks with self-closing tag correctly', () => {
    cy.get('.ProseMirror').then(([{ editor }]) => {
      editor.setContent('<p>Example<br />Text</p>')
      expect(editor.html()).to.eq('<p>Example<br>Text</p>')
    })
  })

  it('the button should add a line break', () => {
    cy.get('.ProseMirror br')
      .should('not.exist')

    cy.get('.demo__preview button:first')
      .click()

    cy.get('.ProseMirror br')
      .should('exist')
  })

  it.skip('the default keyboard shortcut should add a line break', () => {
    cy.get('.ProseMirror br')
      .should('not.exist')

    cy.get('.ProseMirror')
      .trigger('keydown', { shiftKey: true, key: 'Enter' })

    cy.get('.ProseMirror br')
      .should('exist')
  })

  it('the alternative keyboard shortcut should add a line break', () => {
    cy.get('.ProseMirror br')
      .should('not.exist')

    cy.get('.ProseMirror')
      .trigger('keydown', { modKey: true, key: 'Enter' })

    cy.get('.ProseMirror br')
      .should('exist')
  })
})
