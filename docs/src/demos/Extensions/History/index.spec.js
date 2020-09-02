context('/api/extensions/history', () => {
  beforeEach(() => {
    cy.visit('/api/extensions/history')

    cy.get('.ProseMirror').window().then(window => {
      const { editor } = window
      editor.setContent('<p>Mistake</p>')
    })
  })

  describe('undo', () => {
    it('should make the last change undone', () => {
      cy.get('.ProseMirror').window().then(window => {
        const { editor } = window
        cy.get('.ProseMirror').should('contain', 'Mistake')

        cy.get('.demo__preview button:first').click({ force: true })
        cy.get('.ProseMirror').should('not.contain', 'Mistake')
      })
    })
  })

  describe('redo', () => {
    it('should apply the last undone change again', () => {
      cy.get('.ProseMirror').window().then(window => {
        const { editor } = window
        cy.get('.ProseMirror').should('contain', 'Mistake')

        cy.get('.demo__preview button:first').click({ force: true })
        cy.get('.ProseMirror').should('not.contain', 'Mistake')
        cy.get('.demo__preview button:nth-child(2)').click({ force: true })
        cy.get('.ProseMirror').should('contain', 'Mistake')
      })
    })
  })
})


// context('/api/extensions/history', () => {
//   beforeEach(() => {
//     cy.visit('/api/extensions/history')

//     cy.get('.ProseMirror').window().then(window => {
//       const { editor } = window
//       editor.setContent('<p>as</p>')
//     })
//   })

//   describe('history', () => {
//     it('should make the selected text history', () => {
//       cy.get('.ProseMirror').window().then(window => {
//         const { editor } = window
//         const html = editor.html()

//         cy.get('.ProseMirror').type('Mistake', { force: true })
//         // cy.get('.ProseMirror').should('contain', 'Mistake')
//         // cy.get('.demo__preview button:first').click({ force: true })
//         // cy.get('.ProseMirror').should('contain', 'Mistake')
//       })
//     })


//       editor.insertText('Mistake')
//       cy.get('.ProseMirror h2:first').should('contain', 'Mistake')

//     // it('should toggle the selected text history', () => {
//     //   cy.get('.demo__preview button:first').dblclick({ force: true })
//     //   cy.get('.ProseMirror em').should('not.exist')
//     // })
//   })
// })