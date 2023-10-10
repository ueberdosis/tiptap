context('/src/Examples/InteractivityComponentContent/Vue/', () => {
  beforeEach(() => {
    cy.visit('/src/Examples/InteractivityComponentContent/Vue/')
  })

  it('should have a working tiptap instance', () => {
    cy.get('.tiptap').then(([{ editor }]) => {
      // eslint-disable-next-line
      expect(editor).to.not.be.null
    })
  })

  it('should render a custom node', () => {
    cy.get('.tiptap .vue-component')
      .should('have.length', 1)
  })

  it('should allow text editing inside component', () => {
    cy.get('.tiptap .vue-component .content')
      .invoke('attr', 'contentEditable', true)
      .invoke('text', '')
      .type('Hello World!')
      .should('have.text', 'Hello World!')
  })

  it('should allow text editing inside component with markdown text', () => {
    cy.get('.tiptap .vue-component .content')
      .invoke('attr', 'contentEditable', true)
      .invoke('text', '')
      .type('Hello World! This is **bold**.')
      .should('have.text', 'Hello World! This is bold.')

    cy.get('.tiptap .vue-component .content strong')
      .should('exist')
  })

  it('should remove node via selectall', () => {
    cy.get('.tiptap .vue-component')
      .should('have.length', 1)

    cy.get('.tiptap')
      .type('{selectall}{backspace}')

    cy.get('.tiptap .vue-component')
      .should('have.length', 0)
  })
})
