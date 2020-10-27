context('/api/extensions/heading', () => {
  before(() => {
    cy.visit('/api/extensions/heading')
  })

  beforeEach(() => {
    cy.get('.ProseMirror').then(([{ editor }]) => {
      editor.setContent('<p>Example Text</p>')
      editor.selectAll()
    })
  })

  const headings = [
    '<h1>Example Text</h1>',
    '<h2>Example Text</h2>',
    '<h3>Example Text</h3>',
  ]

  headings.forEach(html => {
    it(`should parse headings correctly (${html})`, () => {
      cy.get('.ProseMirror').then(([{ editor }]) => {
        editor.setContent(html)
        expect(editor.getHTML()).to.eq(html)
      })
    })
  })

  it('should omit disabled heading levels', () => {
    cy.get('.ProseMirror').then(([{ editor }]) => {
      editor.setContent('<h4>Example Text</h4>')
      expect(editor.getHTML()).to.eq('<p>Example Text</p>')
    })
  })

  it('the button should make the selected line a h1', () => {
    cy.get('.ProseMirror h1')
      .should('not.exist')

    cy.get('.demo__preview button:nth-child(1)')
      .click()

    cy.get('.ProseMirror')
      .find('h1')
      .should('contain', 'Example Text')
  })

  it('the button should make the selected line a h2', () => {
    cy.get('.ProseMirror h2')
      .should('not.exist')

    cy.get('.demo__preview button:nth-child(2)')
      .click()

    cy.get('.ProseMirror')
      .find('h2')
      .should('contain', 'Example Text')
  })

  it('the button should make the selected line a h3', () => {
    cy.get('.ProseMirror h3')
      .should('not.exist')

    cy.get('.demo__preview button:nth-child(3)')
      .click()

    cy.get('.ProseMirror')
      .find('h3')
      .should('contain', 'Example Text')
  })

  it('the button should toggle the heading', () => {
    cy.get('.ProseMirror h1')
      .should('not.exist')

    cy.get('.demo__preview button:nth-child(1)')
      .click()

    cy.get('.ProseMirror')
      .find('h1')
      .should('contain', 'Example Text')

    cy.get('.demo__preview button:nth-child(1)')
      .click()

    cy.get('.ProseMirror h1')
      .should('not.exist')
  })

  it('should make a heading from the default markdown shortcut', () => {
    cy.get('.ProseMirror').then(([{ editor }]) => {
      editor.clearContent()
    })

    cy.get('.ProseMirror')
      .type('# Headline')
      .find('h1')
      .should('contain', 'Headline')
  })
})
