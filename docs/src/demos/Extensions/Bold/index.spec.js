context('/api/extensions/bold', () => {
  before(() => {
    cy.visit('/api/extensions/bold')
  })

  beforeEach(() => {
    cy.get('.ProseMirror').then(([{ editor }]) => {
      editor.setContent('<p>Example Text</p>')
      editor.selectAll()
    })
  })

  it('the button should make the selected text bold', () => {
    cy.get('.demo__preview button:first')
      .click()

    cy.get('.ProseMirror')
      .find('strong')
      .should('contain', 'Example Text')
  })

  it('the button should toggle the selected text bold', () => {
    cy.get('.demo__preview button:first').click()
    cy.get('.ProseMirror').type('{selectall}')
    cy.get('.demo__preview button:first').click()
    cy.get('.ProseMirror strong').should('not.exist')
  })

  it('the keyboard shortcut should make the selected text bold', () => {
    cy.get('.ProseMirror')
      .trigger('keydown', { modKey: true, key: 'b' })
      .find('strong')
      .should('contain', 'Example Text')
  })

  it('the keyboard shortcut should toggle the selected text bold', () => {
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