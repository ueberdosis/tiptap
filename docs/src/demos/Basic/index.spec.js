context('basic', () => {
  beforeEach(() => {
    cy.visit('/basic')
  })

  describe('export', () => {
    it('should return html', () => {
      cy.get('.ProseMirror').window().then(window => {
        const { editor } = window
        const html = editor.html()

        expect(html).to.equal('<p>foo</p>')
      })
    })

    it('should return json', () => {
      cy.get('.ProseMirror').window().then(window => {
        const { editor } = window
        const json = editor.json()

        expect(json).to.deep.equal({
          type: 'document',
          content: [
            {
              type: 'paragraph',
              content: [
                {
                  type: 'text',
                  text: 'foo'
                }
              ]
            }
          ]
        })
      })
    })
  })

  describe('insertText', () => {
    it('should prepend', () => {
      cy.get('.ProseMirror').window().then(window => {
        const { editor } = window

        editor.insertText('bar')
        cy.get('.ProseMirror p:first').should('contain', 'barfoo')
      })
    })

    it('should append', () => {
      cy.get('.ProseMirror').window().then(window => {
        const { editor } = window

        editor.focus('end').insertText('bar')
        cy.get('.ProseMirror p:first').should('contain', 'foobar')
      })
    })
  })

  describe('insertHTML', () => {
    it('should prepend', () => {
      cy.get('.ProseMirror').window().then(window => {
        const { editor } = window

        editor.focus('start').insertHTML('<p>bar</p>')
        cy.get('.ProseMirror p:first').should('contain', 'bar').should('not.contain', 'foo')
        cy.get('.ProseMirror p:last').should('contain', 'foo').should('not.contain', 'bar')
      })
    })

    it('should append', () => {
      cy.get('.ProseMirror').window().then(window => {
        const { editor } = window

        editor.focus('end').insertHTML('<p>bar</p>')
        cy.get('.ProseMirror p:first').should('contain', 'foo').should('not.contain', 'bar')
        cy.get('.ProseMirror p:last').should('contain', 'bar').should('not.contain', 'foo')
      })
    })
  })
})