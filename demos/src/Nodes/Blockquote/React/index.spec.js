context('/src/Nodes/Blockquote/React/', () => {
  before(() => {
    cy.visit('/src/Nodes/Blockquote/React/')
  })

  beforeEach(() => {
    cy.get('.tiptap').then(([{ editor }]) => {
      editor.commands.setContent('<p>Example Text</p>')
      cy.get('.tiptap').type('{selectall}')
    })
  })

  it('should parse blockquote tags correctly', () => {
    cy.get('.tiptap').then(([{ editor }]) => {
      editor.commands.setContent('<blockquote><p>Example Text</p></blockquote>')
      expect(editor.getHTML()).to.eq('<blockquote><p>Example Text</p></blockquote>')
    })
  })

  it('should parse blockquote tags without paragraphs correctly', () => {
    cy.get('.tiptap').then(([{ editor }]) => {
      editor.commands.setContent('<blockquote>Example Text</blockquote>')
      expect(editor.getHTML()).to.eq('<blockquote><p>Example Text</p></blockquote>')
    })
  })

  it('the button should make the selected line a blockquote', () => {
    cy.get('.tiptap blockquote').should('not.exist')

    cy.get('button:first').click()

    cy.get('.tiptap').find('blockquote').should('contain', 'Example Text')
  })

  it('the button should wrap all nodes in one blockquote', () => {
    cy.get('.tiptap').then(([{ editor }]) => {
      editor.commands.setContent('<p>Example Text</p><p>Example Text</p>')
      cy.get('.tiptap').type('{selectall}')
    })

    cy.get('button:first').click()

    cy.get('.tiptap').find('blockquote').should('have.length', 1)
  })

  it('the button should toggle the blockquote', () => {
    cy.get('.tiptap blockquote').should('not.exist')

    cy.get('button:first').click()

    cy.get('.tiptap').find('blockquote').should('contain', 'Example Text')

    cy.get('.tiptap').type('{selectall}')

    cy.get('button:first').click()

    cy.get('.tiptap blockquote').should('not.exist')
  })

  it('should make the selected line a blockquote when the keyboard shortcut is pressed', () => {
    cy.get('.tiptap')
      .trigger('keydown', { shiftKey: true, modKey: true, key: 'b' })
      .find('blockquote')
      .should('contain', 'Example Text')
  })

  it('should toggle the blockquote when the keyboard shortcut is pressed', () => {
    cy.get('.tiptap blockquote').should('not.exist')

    cy.get('.tiptap')
      .trigger('keydown', { shiftKey: true, modKey: true, key: 'b' })
      .find('blockquote')
      .should('contain', 'Example Text')

    cy.get('.tiptap')
      .type('{selectall}')
      .trigger('keydown', { shiftKey: true, modKey: true, key: 'b' })

    cy.get('.tiptap blockquote').should('not.exist')
  })

  it('should make a blockquote from markdown shortcuts', () => {
    cy.get('.tiptap').type('> Quote').find('blockquote').should('contain', 'Quote')
  })
})
