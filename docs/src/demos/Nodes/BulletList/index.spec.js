context('/demos/Nodes/BulletList', () => {
  before(() => {
    cy.visit('/demos/Nodes/BulletList')
  })

  beforeEach(() => {
    cy.get('.ProseMirror').then(([{ editor }]) => {
      editor.commands.setContent('<p>Example Text</p>')
      cy.get('.ProseMirror').type('{selectall}')
    })
  })

  it('should parse unordered lists correctly', () => {
    cy.get('.ProseMirror').then(([{ editor }]) => {
      editor.commands.setContent('<ul><li><p>Example Text</p></li></ul>')
      expect(editor.getHTML()).to.eq('<ul><li><p>Example Text</p></li></ul>')
    })
  })

  it('should parse unordered lists without paragraphs correctly', () => {
    cy.get('.ProseMirror').then(([{ editor }]) => {
      editor.commands.setContent('<ul><li>Example Text</li></ul>')
      expect(editor.getHTML()).to.eq('<ul><li><p>Example Text</p></li></ul>')
    })
  })

  it('the button should make the selected line a bullet list item', () => {
    cy.get('.ProseMirror ul')
      .should('not.exist')

    cy.get('.ProseMirror ul li')
      .should('not.exist')

    cy.get('.demo__preview button:nth-child(1)')
      .click()

    cy.get('.ProseMirror')
      .find('ul')
      .should('contain', 'Example Text')

    cy.get('.ProseMirror')
      .find('ul li')
      .should('contain', 'Example Text')
  })

  it('the button should toggle the bullet list', () => {
    cy.get('.ProseMirror ul')
      .should('not.exist')

    cy.get('.demo__preview button:nth-child(1)')
      .click()

    cy.get('.ProseMirror')
      .find('ul')
      .should('contain', 'Example Text')

    cy.get('.demo__preview button:nth-child(1)')
      .click()

    cy.get('.ProseMirror ul')
      .should('not.exist')
  })

  it('should leave the list with double enter', () => {
    cy.get('.ProseMirror').then(([{ editor }]) => {
      editor.commands.clearContent()
    })

    cy.get('.ProseMirror')
      .type('- List Item 1{enter}{enter}Paragraph')

    cy.get('.ProseMirror')
      .find('li')
      .its('length')
      .should('eq', 1)

    cy.get('.ProseMirror')
      .find('p')
      .should('contain', 'Paragraph')
  })

  it('should make the paragraph a bullet list keyboard shortcut is pressed', () => {
    cy.get('.ProseMirror')
      .trigger('keydown', { modKey: true, shiftKey: true, key: '8' })
      .find('ul li')
      .should('contain', 'Example Text')
  })

  it('should make a bullet list from an asterisk', () => {
    cy.get('.ProseMirror').then(([{ editor }]) => {
      editor.commands.clearContent()
    })

    cy.get('.ProseMirror')
      .type('* List Item 1{enter}List Item 2')

    cy.get('.ProseMirror')
      .find('li:nth-child(1)')
      .should('contain', 'List Item 1')

    cy.get('.ProseMirror')
      .find('li:nth-child(2)')
      .should('contain', 'List Item 2')
  })

  it('should make a bullet list from a dash', () => {
    cy.get('.ProseMirror').then(([{ editor }]) => {
      editor.commands.clearContent()
    })

    cy.get('.ProseMirror')
      .type('- List Item 1{enter}List Item 2')

    cy.get('.ProseMirror')
      .find('li:nth-child(1)')
      .should('contain', 'List Item 1')

    cy.get('.ProseMirror')
      .find('li:nth-child(2)')
      .should('contain', 'List Item 2')
  })

  it('should make a bullet list from a plus', () => {
    cy.get('.ProseMirror').then(([{ editor }]) => {
      editor.commands.clearContent()
    })

    cy.get('.ProseMirror')
      .type('+ List Item 1{enter}List Item 2')

    cy.get('.ProseMirror')
      .find('li:nth-child(1)')
      .should('contain', 'List Item 1')

    cy.get('.ProseMirror')
      .find('li:nth-child(2)')
      .should('contain', 'List Item 2')
  })

  it('should remove the bullet list after pressing backspace', () => {
    cy.get('.ProseMirror').then(([{ editor }]) => {
      editor.commands.clearContent()
    })

    cy.get('.ProseMirror')
      .type('* {backspace}Example')

    cy.get('.ProseMirror')
      .find('p')
      .should('contain', '* Example')
  })
})
