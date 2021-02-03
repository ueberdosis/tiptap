context('/demos/Marks/Bold', () => {
  before(() => {
    cy.visit('/demos/Marks/Bold')
  })

  beforeEach(() => {
    cy.get('.ProseMirror').then(([{ editor }]) => {
      editor.commands.setContent('<p>Example Text</p>')
      cy.get('.ProseMirror').type('{selectall}')
    })
  })

  it('should transform b tags to strong tags', () => {
    cy.get('.ProseMirror').then(([{ editor }]) => {
      editor.commands.setContent('<p><b>Example Text</b></p>')
      expect(editor.getHTML()).to.eq('<p><strong>Example Text</strong></p>')
    })
  })

  it('sould omit b tags with normal font weight inline style', () => {
    cy.get('.ProseMirror').then(([{ editor }]) => {
      editor.commands.setContent('<p><b style="font-weight: normal">Example Text</b></p>')
      expect(editor.getHTML()).to.eq('<p>Example Text</p>')
    })
  })

  it('should transform any tag with bold inline style to strong tags', () => {
    cy.get('.ProseMirror').then(([{ editor }]) => {
      editor.commands.setContent('<p><span style="font-weight: bold">Example Text</span></p>')
      expect(editor.getHTML()).to.eq('<p><strong>Example Text</strong></p>')

      editor.commands.setContent('<p><span style="font-weight: bolder">Example Text</span></p>')
      expect(editor.getHTML()).to.eq('<p><strong>Example Text</strong></p>')

      editor.commands.setContent('<p><span style="font-weight: 500">Example Text</span></p>')
      expect(editor.getHTML()).to.eq('<p><strong>Example Text</strong></p>')

      editor.commands.setContent('<p><span style="font-weight: 900">Example Text</span></p>')
      expect(editor.getHTML()).to.eq('<p><strong>Example Text</strong></p>')
    })
  })

  it('the button should make the selected text bold', () => {
    cy.get('button:first')
      .click()

    cy.get('.ProseMirror')
      .find('strong')
      .should('contain', 'Example Text')
  })

  it('the button should toggle the selected text bold', () => {
    cy.get('button:first').click()
    cy.get('.ProseMirror').type('{selectall}')
    cy.get('button:first').click()
    cy.get('.ProseMirror strong').should('not.exist')
  })

  it('should make the selected text bold when the keyboard shortcut is pressed', () => {
    cy.get('.ProseMirror')
      .trigger('keydown', { modKey: true, key: 'b' })
      .find('strong')
      .should('contain', 'Example Text')
  })

  it('should toggle the selected text bold when the keyboard shortcut is pressed', () => {
    cy.get('.ProseMirror')
      .trigger('keydown', { modKey: true, key: 'b' })
      .find('strong')
      .should('contain', 'Example Text')

    cy.get('.ProseMirror')
      .trigger('keydown', { modKey: true, key: 'b' })

    cy.get('.ProseMirror strong').should('not.exist')
  })

  it('should make a bold text from the default markdown shortcut', () => {
    cy.get('.ProseMirror')
      .type('**Bold**')
      .find('strong')
      .should('contain', 'Bold')
  })

  it('should make a bold text from the alternative markdown shortcut', () => {
    cy.get('.ProseMirror')
      .type('__Bold__')
      .find('strong')
      .should('contain', 'Bold')
  })
})
