context('basic', () => {
  beforeEach(() => {
    cy.visit('/tests/basic')
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
          type: 'doc',
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
    it('should prepend text', () => {
      cy.get('.ProseMirror').window().then(window => {
        const { editor } = window

        editor.insertText('bar')
        cy.get('.ProseMirror p:first').should('contain', 'barfoo')
        //.contains('barfoo')
        // .should('contain', 'barfoo')
      })
    })

    it('should append text', () => {
      cy.get('.ProseMirror').window().then(window => {
        const { editor } = window

        editor.focus('end').insertText('bar')
        cy.get('.ProseMirror p:first').should('contain', 'foobar')
      })
    })

    it('should append html', () => {
      cy.get('.ProseMirror').window().then(window => {
        const { editor } = window

        editor.focus('end').insertHTML('<p>bar</p>')
        cy.get('.ProseMirror p:first').should('contain', 'foobar')
      })
    })
  })
})