context('/src/Marks/Italic/Vue/', () => {
  before(() => {
    cy.visit('/src/Marks/Italic/Vue/')
  })

  beforeEach(() => {
    cy.get('.tiptap').then(([{ editor }]) => {
      editor.commands.setContent('<p>Example Text</p>')
      cy.get('.tiptap').type('{selectall}')
    })
  })

  it('i tags should be transformed to em tags', () => {
    cy.get('.tiptap').then(([{ editor }]) => {
      editor.commands.setContent('<p><i>Example Text</i></p>')
      expect(editor.getHTML()).to.eq('<p><em>Example Text</em></p>')
    })
  })

  it('i tags with normal font style should be omitted', () => {
    cy.get('.tiptap').then(([{ editor }]) => {
      editor.commands.setContent('<p><i style="font-style: normal">Example Text</i></p>')
      expect(editor.getHTML()).to.eq('<p>Example Text</p>')
    })
  })

  it('generic tags with italic style should be transformed to strong tags', () => {
    cy.get('.tiptap').then(([{ editor }]) => {
      editor.commands.setContent('<p><span style="font-style: italic">Example Text</span></p>')
      expect(editor.getHTML()).to.eq('<p><em>Example Text</em></p>')
    })
  })

  it('the button should make the selected text italic', () => {
    cy.get('button:first')
      .click()

    cy.get('.tiptap')
      .find('em')
      .should('contain', 'Example Text')
  })

  it('the button should toggle the selected text italic', () => {
    cy.get('button:first')
      .click()

    cy.get('.tiptap')
      .type('{selectall}')

    cy.get('button:first')
      .click()

    cy.get('.tiptap em')
      .should('not.exist')
  })

  it('the keyboard shortcut should make the selected text italic', () => {
    cy.get('.tiptap')
      .trigger('keydown', { modKey: true, key: 'i' })
      .find('em')
      .should('contain', 'Example Text')
  })

  it('the keyboard shortcut should toggle the selected text italic', () => {
    cy.get('.tiptap')
      .trigger('keydown', { modKey: true, key: 'i' })
      .trigger('keydown', { modKey: true, key: 'i' })
      .find('em')
      .should('not.exist')
  })
})
