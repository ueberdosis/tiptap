context('/src/Nodes/BulletList/React/', () => {
  before(() => {
    cy.visit('/src/Nodes/BulletList/React/')
  })

  beforeEach(() => {
    cy.get('.tiptap').then(([{ editor }]) => {
      editor.commands.setContent('<p>Example Text</p>')
      cy.get('.tiptap').type('{selectall}')
    })
  })

  it('should parse unordered lists correctly', () => {
    cy.get('.tiptap').then(([{ editor }]) => {
      editor.commands.setContent('<ul><li><p>Example Text</p></li></ul>')
      expect(editor.getHTML()).to.eq('<ul><li><p>Example Text</p></li></ul>')
    })
  })

  it('should parse unordered lists without paragraphs correctly', () => {
    cy.get('.tiptap').then(([{ editor }]) => {
      editor.commands.setContent('<ul><li>Example Text</li></ul>')
      expect(editor.getHTML()).to.eq('<ul><li><p>Example Text</p></li></ul>')
    })
  })

  it('the button should make the selected line a bullet list item', () => {
    cy.get('.tiptap ul').should('not.exist')

    cy.get('.tiptap ul li').should('not.exist')

    cy.get('button:nth-child(1)').click()

    cy.get('.tiptap').find('ul').should('contain', 'Example Text')

    cy.get('.tiptap').find('ul li').should('contain', 'Example Text')
  })

  it('the button should toggle the bullet list', () => {
    cy.get('.tiptap ul').should('not.exist')

    cy.get('button:nth-child(1)').click()

    cy.get('.tiptap').find('ul').should('contain', 'Example Text')

    cy.get('button:nth-child(1)').click()

    cy.get('.tiptap ul').should('not.exist')
  })

  it('should leave the list with double enter', () => {
    cy.get('.tiptap').then(([{ editor }]) => {
      editor.commands.clearContent()
    })

    cy.get('.tiptap').type('- List Item 1{enter}{enter}Paragraph')

    cy.get('.tiptap').find('li').its('length').should('eq', 1)

    cy.get('.tiptap').find('p').should('contain', 'Paragraph')
  })

  it('should make the paragraph a bullet list keyboard shortcut is pressed', () => {
    cy.get('.tiptap')
      .trigger('keydown', { modKey: true, shiftKey: true, key: '8' })
      .find('ul li')
      .should('contain', 'Example Text')
  })

  it('should make a bullet list from an asterisk', () => {
    cy.get('.tiptap').then(([{ editor }]) => {
      editor.commands.clearContent()
    })

    cy.get('.tiptap').type('* List Item 1{enter}List Item 2')

    cy.get('.tiptap').find('li:nth-child(1)').should('contain', 'List Item 1')

    cy.get('.tiptap').find('li:nth-child(2)').should('contain', 'List Item 2')
  })

  it('should make a bullet list from a dash', () => {
    cy.get('.tiptap').then(([{ editor }]) => {
      editor.commands.clearContent()
    })

    cy.get('.tiptap').type('- List Item 1{enter}List Item 2')

    cy.get('.tiptap').find('li:nth-child(1)').should('contain', 'List Item 1')

    cy.get('.tiptap').find('li:nth-child(2)').should('contain', 'List Item 2')
  })

  it('should make a bullet list from a plus', () => {
    cy.get('.tiptap').then(([{ editor }]) => {
      editor.commands.clearContent()
    })

    cy.get('.tiptap').type('+ List Item 1{enter}List Item 2')

    cy.get('.tiptap').find('li:nth-child(1)').should('contain', 'List Item 1')

    cy.get('.tiptap').find('li:nth-child(2)').should('contain', 'List Item 2')
  })

  it('should remove the bullet list after pressing backspace', () => {
    cy.get('.tiptap').then(([{ editor }]) => {
      editor.commands.clearContent()
    })

    cy.get('.tiptap').type('* {backspace}Example')

    cy.get('.tiptap').find('p').should('contain', '* Example')
  })
})
