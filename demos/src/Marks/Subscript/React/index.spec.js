context('/src/Marks/Subscript/React/', () => {
  before(() => {
    cy.visit('/src/Marks/Subscript/React/')
  })

  beforeEach(() => {
    cy.get('.ProseMirror').then(([{ editor }]) => {
      editor.commands.setContent('<p>Example Text</p>')
      cy.get('.ProseMirror').type('{selectall}')
    })
  })

  it('should transform inline style to sub tags', () => {
    cy.get('.ProseMirror').then(([{ editor }]) => {
      editor.commands.setContent('<p><span style="vertical-align: sub">Example Text</span></p>')
      expect(editor.getHTML()).to.eq('<p><sub>Example Text</sub></p>')
    })
  })

  it('sould omit inline style with a different vertical align', () => {
    cy.get('.ProseMirror').then(([{ editor }]) => {
      editor.commands.setContent('<p><b style="vertical-align: middle">Example Text</b></p>')
      expect(editor.getHTML()).to.eq('<p>Example Text</p>')
    })
  })

  it('the button should make the selected text bold', () => {
    cy.get('button:first').click()

    cy.get('.ProseMirror').find('sub').should('contain', 'Example Text')
  })

  it('the button should toggle the selected text bold', () => {
    cy.get('button:first').click()
    cy.get('.ProseMirror').type('{selectall}')
    cy.get('button:first').click()
    cy.get('.ProseMirror sub').should('not.exist')
  })
})
