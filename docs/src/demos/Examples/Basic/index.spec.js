context('basic', () => {
  beforeEach(() => {
    cy.visit('/examples/basic')

    cy.get('.ProseMirror').window().then(window => {
      const { editor } = window
      editor.setContent('<p>foo</p>')
    })
  })

  describe('export', () => {
    it('set the content to something simple', () => {
      cy.get('.ProseMirror').window().then(window => {
        const { editor } = window
      })
    })

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

        editor.focus(1).insertText('bar')
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