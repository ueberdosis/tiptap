context('/api/extensions/blockquote', () => {
  before(() => {
    cy.visit('/api/extensions/blockquote')
  })

  beforeEach(() => {
    cy.get('.ProseMirror').then(([{ editor }]) => {
      editor.setContent('<p>Example Text</p>')
      editor.selectAll()
    })
  })

  it('should parse blockquote tags correctly', () => {
    cy.get('.ProseMirror').then(([{ editor }]) => {
      editor.setContent('<blockquote><p>Example Text</p></blockquote>')
      expect(editor.html()).to.eq('<blockquote><p>Example Text</p></blockquote>')
    })
  })

  it('should parse blockquote tags without paragraphs correctly', () => {
    cy.get('.ProseMirror').then(([{ editor }]) => {
      editor.setContent('<blockquote>Example Text</blockquote>')
      expect(editor.html()).to.eq('<blockquote><p>Example Text</p></blockquote>')
    })
  })

  it('the button should make the selected line a blockquote', () => {
    cy.get('.ProseMirror blockquote')
      .should('not.exist')

    cy.get('.demo__preview button:first')
      .click()

    cy.get('.ProseMirror')
      .find('blockquote')
      .should('contain', 'Example Text')
  })

  it('the button should wrap all nodes in one blockquote', () => {
    cy.get('.ProseMirror').then(([{ editor }]) => {
      editor.setContent('<p>Example Text</p><p>Example Text</p>')
      editor.selectAll()
    })

    cy.get('.demo__preview button:first')
      .click()

    cy.get('.ProseMirror')
      .find('blockquote')
      .should('have.length', 1)
  })

  it('the button should toggle the blockquote', () => {
    cy.get('.ProseMirror blockquote')
      .should('not.exist')

    cy.get('.demo__preview button:first')
      .click()

    cy.get('.ProseMirror')
      .find('blockquote')
      .should('contain', 'Example Text')

    cy.get('.ProseMirror')
      .type('{selectall}')

    cy.get('.demo__preview button:first')
      .click()

    cy.get('.ProseMirror blockquote')
      .should('not.exist')
  })

  it('the keyboard shortcut should make the selected line a blockquote', () => {
    cy.get('.ProseMirror')
      .trigger('keydown', { shiftKey: true, modKey: true, key: '9' })
      .find('blockquote')
      .should('contain', 'Example Text')
  })

  it('the keyboard shortcut should toggle the blockquote', () => {
    cy.get('.ProseMirror blockquote')
      .should('not.exist')

    cy.get('.ProseMirror')
      .trigger('keydown', { shiftKey: true, modKey: true, key: '9' })
      .find('blockquote')
      .should('contain', 'Example Text')

    cy.get('.ProseMirror')
      .type('{selectall}')
      .trigger('keydown', { shiftKey: true, modKey: true, key: '9' })

    cy.get('.ProseMirror blockquote')
      .should('not.exist')
  })

  it('should make a blockquote from markdown shortcuts', () => {
    cy.get('.ProseMirror')
      .type('> Quote')
      .find('blockquote')
      .should('contain', 'Quote')
  })
})
