context('/src/Marks/Highlight/React/', () => {
  before(() => {
    cy.visit('/src/Marks/Highlight/React/')
  })

  beforeEach(() => {
    cy.get('.ProseMirror').then(([{ editor }]) => {
      editor.chain().setContent('<p>Example Text</p>').selectAll().run()
    })
  })

  it('the button should highlight the selected text', () => {
    cy.get('button:first').click()

    cy.get('.ProseMirror').find('mark').should('contain', 'Example Text')
  })

  it('should highlight the text in a specific color', () => {
    cy.get('.ProseMirror').then(([{ editor }]) => {
      editor.commands.toggleHighlight({ color: 'red' })

      cy.get('.ProseMirror')
        .find('mark')
        .should('contain', 'Example Text')
        .should('have.attr', 'data-color', 'red')
    })
  })

  it('should update the attributes of existing marks', () => {
    cy.get('.ProseMirror').then(([{ editor }]) => {
      editor
        .chain()
        .setContent('<p><mark style="background-color: blue;">Example Text</mark></p>')
        .selectAll()
        .toggleHighlight({ color: 'rgb(255, 0, 0)' })
        .run()

      cy.get('.ProseMirror').find('mark').should('have.css', 'background-color', 'rgb(255, 0, 0)')
    })
  })

  it('should remove existing marks with the same attributes', () => {
    cy.get('.ProseMirror').then(([{ editor }]) => {
      editor
        .chain()
        .setContent('<p><mark style="background-color: rgb(255, 0, 0);">Example Text</mark></p>')
        .selectAll()
        .toggleHighlight({ color: 'rgb(255, 0, 0)' })
        .run()

      cy.get('.ProseMirror').find('mark').should('not.exist')
    })
  })

  it('is active for mark with any attributes', () => {
    cy.get('.ProseMirror').then(([{ editor }]) => {
      editor
        .chain()
        .setContent('<p><mark data-color="red">Example Text</mark></p>')
        .selectAll()
        .run()

      expect(editor.isActive('highlight')).to.eq(true)
    })
  })

  it('is active for mark with same attributes', () => {
    cy.get('.ProseMirror').then(([{ editor }]) => {
      editor
        .chain()
        .setContent('<p><mark style="background-color: rgb(255, 0, 0);">Example Text</mark></p>')
        .selectAll()
        .run()

      const isActive = editor.isActive('highlight', {
        color: 'rgb(255, 0, 0)',
      })

      expect(isActive).to.eq(true)
    })
  })

  it('isn’t active for mark with other attributes', () => {
    cy.get('.ProseMirror').then(([{ editor }]) => {
      editor
        .chain()
        .setContent('<p><mark style="background-color: rgb(255, 0, 0);">Example Text</mark></p>')
        .selectAll()
        .run()

      const isActive = editor.isActive('highlight', {
        color: 'rgb(0, 0, 0)',
      })

      expect(isActive).to.eq(false)
    })
  })

  it('the button should toggle the selected text highlighted', () => {
    cy.get('button:first').click()

    cy.get('.ProseMirror').type('{selectall}')

    cy.get('button:first').click()

    cy.get('.ProseMirror').find('mark').should('not.exist')
  })

  it('should highlight the selected text when the keyboard shortcut is pressed', () => {
    cy.get('.ProseMirror')
      .trigger('keydown', { modKey: true, shiftKey: true, key: 'h' })
      .find('mark')
      .should('contain', 'Example Text')
  })

  it('should toggle the selected text highlighted when the keyboard shortcut is pressed', () => {
    cy.get('.ProseMirror')
      .trigger('keydown', { modKey: true, shiftKey: true, key: 'h' })
      .trigger('keydown', { modKey: true, shiftKey: true, key: 'h' })
      .find('mark')
      .should('not.exist')
  })
})
