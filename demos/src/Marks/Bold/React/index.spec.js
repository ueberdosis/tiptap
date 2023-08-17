context('/src/Marks/Bold/React/', () => {
  before(() => {
    cy.visit('/src/Marks/Bold/React/')
  })

  beforeEach(() => {
    cy.get('.tiptap').then(([{ editor }]) => {
      editor.commands.setContent('<p>Example Text</p>')
      cy.get('.tiptap').type('{selectall}')
    })
  })

  it('should transform b tags to strong tags', () => {
    cy.get('.tiptap').then(([{ editor }]) => {
      editor.commands.setContent('<p><b>Example Text</b></p>')
      expect(editor.getHTML()).to.eq('<p><strong>Example Text</strong></p>')
    })
  })

  it('sould omit b tags with normal font weight inline style', () => {
    cy.get('.tiptap').then(([{ editor }]) => {
      editor.commands.setContent('<p><b style="font-weight: normal">Example Text</b></p>')
      expect(editor.getHTML()).to.eq('<p>Example Text</p>')
    })
  })

  it('should transform any tag with bold inline style to strong tags', () => {
    cy.get('.tiptap').then(([{ editor }]) => {
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
    cy.get('button:first').click()

    cy.get('.tiptap').find('strong').should('contain', 'Example Text')
  })

  it('the button should toggle the selected text bold', () => {
    cy.get('button:first').click()
    cy.get('.tiptap').type('{selectall}')
    cy.get('button:first').click()
    cy.get('.tiptap strong').should('not.exist')
  })

  it('should make the selected text bold when the keyboard shortcut is pressed', () => {
    cy.get('.tiptap')
      .trigger('keydown', { modKey: true, key: 'b' })
      .find('strong')
      .should('contain', 'Example Text')
  })

  it('should toggle the selected text bold when the keyboard shortcut is pressed', () => {
    cy.get('.tiptap')
      .trigger('keydown', { modKey: true, key: 'b' })
      .find('strong')
      .should('contain', 'Example Text')

    cy.get('.tiptap').trigger('keydown', { modKey: true, key: 'b' })

    cy.get('.tiptap strong').should('not.exist')
  })

  it('should make a bold text from the default markdown shortcut', () => {
    cy.get('.tiptap').type('**Bold**').find('strong').should('contain', 'Bold')
  })

  it('should make a bold text from the alternative markdown shortcut', () => {
    cy.get('.tiptap').type('__Bold__').find('strong').should('contain', 'Bold')
  })
})
