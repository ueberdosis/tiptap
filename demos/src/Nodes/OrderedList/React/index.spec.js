context('/src/Nodes/OrderedList/React/', () => {
  before(() => {
    cy.visit('/src/Nodes/OrderedList/React/')
  })

  beforeEach(() => {
    cy.get('.ProseMirror').then(([{ editor }]) => {
      editor.commands.setContent('<p>Example Text</p>')
      cy.get('.ProseMirror').type('{selectall}')
    })
  })

  it('should parse ordered lists correctly', () => {
    cy.get('.ProseMirror').then(([{ editor }]) => {
      editor.commands.setContent('<ol><li><p>Example Text</p></li></ol>')
      expect(editor.getHTML()).to.eq('<ol><li><p>Example Text</p></li></ol>')
    })
  })

  it('should parse ordered lists without paragraphs correctly', () => {
    cy.get('.ProseMirror').then(([{ editor }]) => {
      editor.commands.setContent('<ol><li>Example Text</li></ol>')
      expect(editor.getHTML()).to.eq('<ol><li><p>Example Text</p></li></ol>')
    })
  })

  it('the button should make the selected line a ordered list item', () => {
    cy.get('.ProseMirror ol').should('not.exist')

    cy.get('.ProseMirror ol li').should('not.exist')

    cy.get('button:nth-child(1)').click()

    cy.get('.ProseMirror').find('ol').should('contain', 'Example Text')

    cy.get('.ProseMirror').find('ol li').should('contain', 'Example Text')
  })

  it('the button should toggle the ordered list', () => {
    cy.get('.ProseMirror ol').should('not.exist')

    cy.get('button:nth-child(1)').click()

    cy.get('.ProseMirror').find('ol').should('contain', 'Example Text')

    cy.get('button:nth-child(1)').click()

    cy.get('.ProseMirror ol').should('not.exist')
  })

  it('should make the paragraph an ordered list keyboard shortcut is pressed', () => {
    cy.get('.ProseMirror')
      .trigger('keydown', { modKey: true, shiftKey: true, key: '7' })
      .find('ol li')
      .should('contain', 'Example Text')
  })

  it('should leave the list with double enter', () => {
    cy.get('.ProseMirror').then(([{ editor }]) => {
      editor.commands.clearContent()
    })

    cy.get('.ProseMirror').type('1. List Item 1{enter}{enter}Paragraph')

    cy.get('.ProseMirror').find('li').its('length').should('eq', 1)

    cy.get('.ProseMirror').find('p').should('contain', 'Paragraph')
  })

  it('should make a ordered list from a number', () => {
    cy.get('.ProseMirror').then(([{ editor }]) => {
      editor.commands.clearContent()
    })

    cy.get('.ProseMirror').type('1. List Item 1{enter}List Item 2')

    cy.get('.ProseMirror').find('li:nth-child(1)').should('contain', 'List Item 1')

    cy.get('.ProseMirror').find('li:nth-child(2)').should('contain', 'List Item 2')
  })

  it('should make a ordered list from a number other than number one', () => {
    cy.get('.ProseMirror').then(([{ editor }]) => {
      editor.commands.clearContent()
    })

    cy.get('.ProseMirror').type('2. List Item 1{enter}List Item 2')

    cy.get('.ProseMirror').find('ol').should('have.attr', 'start', '2')
  })

  it('should remove the ordered list after pressing backspace', () => {
    cy.get('.ProseMirror').then(([{ editor }]) => {
      editor.commands.clearContent()
    })

    cy.get('.ProseMirror').type('1. {backspace}Example')

    cy.get('.ProseMirror').find('p').should('contain', '1. Example')
  })
})
