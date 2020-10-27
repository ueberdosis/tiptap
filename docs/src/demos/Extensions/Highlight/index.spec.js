context('/api/extensions/highlight', () => {
  before(() => {
    cy.visit('/api/extensions/highlight')
  })

  beforeEach(() => {
    cy.get('.ProseMirror').then(([{ editor }]) => {
      editor.setContent('<p>Example Text</p>')
      editor.selectAll()
    })
  })

  it('the button should highlight the selected text', () => {
    cy.get('.demo__preview button:first')
      .click()

    cy.get('.ProseMirror')
      .find('mark')
      .should('contain', 'Example Text')
  })

  it('should highlight the text in a specific color', () => {
    cy.get('.ProseMirror').then(([{ editor }]) => {
      editor.highlight({ color: 'red' })

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
        .highlight({ color: 'rgb(255, 0, 0)' })
        .run()

      cy.get('.ProseMirror')
        .find('mark')
        .should('have.css', 'background-color', 'rgb(255, 0, 0)')
    })
  })

  it('should remove existing marks with the same attributes', () => {
    cy.get('.ProseMirror').then(([{ editor }]) => {
      editor.setContent('<p><mark style="background-color: rgb(255, 0, 0);">Example Text</mark></p>')
      editor.selectAll()

      editor.highlight({ color: 'rgb(255, 0, 0)' })

      cy.get('.ProseMirror')
        .find('mark')
        .should('not.exist')

      editor.isActive('highlight', {
        color: 'rgb(255, 0, 0)',
      })
    })
  })

  it('is active for mark with any attributes', () => {
    cy.get('.ProseMirror').then(([{ editor }]) => {
      editor.setContent('<p><mark data-color="red">Example Text</mark></p>')
      editor.selectAll()

      expect(editor.isActive('highlight')).to.eq(true)
    })
  })

  it('is active for mark with same attributes', () => {
    cy.get('.ProseMirror').then(([{ editor }]) => {
      editor.setContent('<p><mark style="background-color: rgb(255, 0, 0);">Example Text</mark></p>')
      editor.selectAll()

      expect(editor.isActive('highlight', {
        color: 'rgb(255, 0, 0)',
      })).to.eq(true)
    })
  })

  it('isn’t active for mark with other attributes', () => {
    cy.get('.ProseMirror').then(([{ editor }]) => {
      editor.setContent('<p><mark style="background-color: rgb(255, 0, 0);">Example Text</mark></p>')
      editor.selectAll()

      expect(editor.isActive('highlight', {
        color: 'rgb(0, 0, 0)',
      })).to.eq(false)
    })
  })

  it('the button should toggle the selected text highlighted', () => {
    cy.get('.demo__preview button:first')
      .click()

    cy.get('.ProseMirror')
      .type('{selectall}')

    cy.get('.demo__preview button:first')
      .click()

    cy.get('.ProseMirror')
      .find('mark')
      .should('not.exist')
  })

  it('the keyboard shortcut should highlight the selected text', () => {
    cy.get('.ProseMirror')
      .trigger('keydown', { modKey: true, key: 'e' })
      .find('mark')
      .should('contain', 'Example Text')
  })

  it('the keyboard shortcut should toggle the selected text highlighted', () => {
    cy.get('.ProseMirror')
      .trigger('keydown', { modKey: true, key: 'e' })
      .trigger('keydown', { modKey: true, key: 'e' })
      .find('mark')
      .should('not.exist')
  })
})
