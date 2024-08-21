context('/src/Examples/InteractivityComponentContent/React/', () => {
  beforeEach(() => {
    cy.visit('/src/Examples/InteractivityComponentContent/React/')
  })

  it('should have a working tiptap instance', () => {
    cy.get('.tiptap').then(([{ editor }]) => {
      // eslint-disable-next-line
      expect(editor).to.not.be.null
    })
  })

  it('should render a custom node', () => {
    cy.get('.tiptap .react-component')
      .should('have.length', 1)
  })

  it('should allow text editing inside component', () => {
    cy.get('.tiptap .react-component .content div')
      .invoke('attr', 'contentEditable', true)
      .invoke('text', '')
      .type('Hello World!')
      .should('have.text', 'Hello World!')
  })

  it('should allow text editing inside component with markdown text', () => {
    cy.get('.tiptap .react-component .content div')
      .invoke('attr', 'contentEditable', true)
      .invoke('text', '')
      .click()
    cy.get('.tiptap .react-component .content div')
      .realType('Hello World! This is **bold**.')
    cy.get('.tiptap .react-component .content div')
      .should('have.text', 'Hello World! This is bold.')

    cy.get('.tiptap .react-component .content strong')
      .should('exist')
  })

  it('should remove node via selectall', () => {
    cy.get('.tiptap .react-component')
      .should('have.length', 1)

    cy.get('.tiptap')
      .type('{selectall}{backspace}')

    cy.get('.tiptap .react-component')
      .should('have.length', 0)
  })
})
