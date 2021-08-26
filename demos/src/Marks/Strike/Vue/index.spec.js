context('/src/Marks/Strike/Vue/', () => {
  before(() => {
    cy.visit('/src/Marks/Strike/Vue/')
  })

  beforeEach(() => {
    cy.get('.ProseMirror').then(([{ editor }]) => {
      editor.commands.setContent('<p>Example Text</p>')
      cy.get('.ProseMirror').type('{selectall}')
    })
  })

  it('should parse s tags correctly', () => {
    cy.get('.ProseMirror').then(([{ editor }]) => {
      editor.commands.setContent('<p><s>Example Text</s></p>')
      expect(editor.getHTML()).to.eq('<p><s>Example Text</s></p>')
    })
  })

  it('should transform del tags to s tags', () => {
    cy.get('.ProseMirror').then(([{ editor }]) => {
      editor.commands.setContent('<p><del>Example Text</del></p>')
      expect(editor.getHTML()).to.eq('<p><s>Example Text</s></p>')
    })
  })

  it('should transform strike tags to s tags', () => {
    cy.get('.ProseMirror').then(([{ editor }]) => {
      editor.commands.setContent('<p><strike>Example Text</strike></p>')
      expect(editor.getHTML()).to.eq('<p><s>Example Text</s></p>')
    })
  })

  it('should transform any tag with text decoration line through to s tags', () => {
    cy.get('.ProseMirror').then(([{ editor }]) => {
      editor.commands.setContent('<p><span style="text-decoration: line-through">Example Text</span></p>')
      expect(editor.getHTML()).to.eq('<p><s>Example Text</s></p>')
    })
  })

  it('the button should strike the selected text', () => {
    cy.get('button:first')
      .click()

    cy.get('.ProseMirror')
      .find('s')
      .should('contain', 'Example Text')
  })

  it('the button should toggle the selected text striked', () => {
    cy.get('button:first')
      .click()

    cy.get('.ProseMirror')
      .type('{selectall}')

    cy.get('button:first')
      .click()

    cy.get('.ProseMirror')
      .find('s')
      .should('not.exist')
  })

  it('should strike the selected text when the keyboard shortcut is pressed', () => {
    cy.get('.ProseMirror')
      .trigger('keydown', { modKey: true, shiftKey: true, key: 'x' })
      .find('s')
      .should('contain', 'Example Text')
  })

  it('should toggle the selected text striked when the keyboard shortcut is pressed', () => {
    cy.get('.ProseMirror')
      .trigger('keydown', { modKey: true, shiftKey: true, key: 'x' })
      .trigger('keydown', { modKey: true, shiftKey: true, key: 'x' })
      .find('s')
      .should('not.exist')
  })

  it('should make a striked text from the markdown shortcut', () => {
    cy.get('.ProseMirror')
      .type('~~Strike~~')
      .find('s')
      .should('contain', 'Strike')
  })
})
