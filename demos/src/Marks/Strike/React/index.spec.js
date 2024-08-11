context('/src/Marks/Strike/React/', () => {
  before(() => {
    cy.visit('/src/Marks/Strike/React/')
  })

  beforeEach(() => {
    cy.get('.tiptap').then(([{ editor }]) => {
      editor.commands.setContent('<p>Example Text</p>')
      cy.get('.tiptap').type('{selectall}')
    })
  })

  it('should parse s tags correctly', () => {
    cy.get('.tiptap').then(([{ editor }]) => {
      editor.commands.setContent('<p><s>Example Text</s></p>')
      expect(editor.getHTML()).to.eq('<p><s>Example Text</s></p>')
    })
  })

  it('should transform del tags to s tags', () => {
    cy.get('.tiptap').then(([{ editor }]) => {
      editor.commands.setContent('<p><del>Example Text</del></p>')
      expect(editor.getHTML()).to.eq('<p><s>Example Text</s></p>')
    })
  })

  it('should transform strike tags to s tags', () => {
    cy.get('.tiptap').then(([{ editor }]) => {
      editor.commands.setContent('<p><strike>Example Text</strike></p>')
      expect(editor.getHTML()).to.eq('<p><s>Example Text</s></p>')
    })
  })

  it('should transform any tag with text decoration line through to s tags', () => {
    cy.get('.tiptap').then(([{ editor }]) => {
      editor.commands.setContent(
        '<p><span style="text-decoration: line-through">Example Text</span></p>',
      )
      expect(editor.getHTML()).to.eq('<p><s>Example Text</s></p>')
    })
  })

  it('the button should strike the selected text', () => {
    cy.get('button:first').click()

    cy.get('.tiptap').find('s').should('contain', 'Example Text')
  })

  it('the button should toggle the selected text striked', () => {
    cy.get('button:first').click()

    cy.get('.tiptap').type('{selectall}')

    cy.get('button:first').click()

    cy.get('.tiptap').find('s').should('not.exist')
  })

  it('should strike the selected text when the keyboard shortcut is pressed', () => {
    cy.get('.tiptap')
      .trigger('keydown', { modKey: true, shiftKey: true, key: 's' })
      .find('s')
      .should('contain', 'Example Text')
  })

  it('should toggle the selected text striked when the keyboard shortcut is pressed', () => {
    cy.get('.tiptap')
      .trigger('keydown', { modKey: true, shiftKey: true, key: 's' })
      .trigger('keydown', { modKey: true, shiftKey: true, key: 's' })
      .find('s')
      .should('not.exist')
  })

  it('should make a striked text from the markdown shortcut', () => {
    cy.get('.tiptap').type('~~Strike~~').find('s').should('contain', 'Strike')
  })
})
