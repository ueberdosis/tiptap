context('/src/Nodes/HardBreak/React/', () => {
  before(() => {
    cy.visit('/src/Nodes/HardBreak/React/')
  })

  beforeEach(() => {
    cy.get('.tiptap').then(([{ editor }]) => {
      editor.commands.setContent('<p>Example Text</p>')
    })
  })

  it('should parse hard breaks correctly', () => {
    cy.get('.tiptap').then(([{ editor }]) => {
      editor.commands.setContent('<p>Example<br>Text</p>')
      expect(editor.getHTML()).to.eq('<p>Example<br>Text</p>')
    })
  })

  it('should parse hard breaks with self-closing tag correctly', () => {
    cy.get('.tiptap').then(([{ editor }]) => {
      editor.commands.setContent('<p>Example<br />Text</p>')
      expect(editor.getHTML()).to.eq('<p>Example<br>Text</p>')
    })
  })

  it('the button should add a line break', () => {
    cy.get('.tiptap br').should('not.exist')

    cy.get('button:first').click()

    cy.get('.tiptap br').should('exist')
  })

  it('the default keyboard shortcut should add a line break', () => {
    cy.get('.tiptap br').should('not.exist')

    cy.get('.tiptap').trigger('keydown', { shiftKey: true, key: 'Enter' })

    cy.get('.tiptap br').should('exist')
  })

  it('the alternative keyboard shortcut should add a line break', () => {
    cy.get('.tiptap br').should('not.exist')

    cy.get('.tiptap').trigger('keydown', { modKey: true, key: 'Enter' })

    cy.get('.tiptap br').should('exist')
  })
})
