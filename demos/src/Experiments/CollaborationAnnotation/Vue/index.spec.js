context('/src/Experiments/CollaborationAnnotation/Vue/', () => {
  before(() => {
    cy.visit('/src/Experiments/CollaborationAnnotation/Vue/')
  })

  /* it('renders two editors', () => {
    cy.get('.ProseMirror').should('have.length', 2)
  }) */

  // TODO: Fix those tests in the future
  // Current problem is that ProseMirror seems to mismatch a transformation somewhere inside those tests
  // So to fix this, we should look for a different way to simulate the annotation process

  /* it('sets an annotation in editor 1 and shows annotations in both editors', () => {
    cy.window().then(win => {
      cy.stub(win, 'prompt', () => 'This is a test comment')
      cy.get('.editor-1 .ProseMirror').type('{selectall}{backspace}Hello world{selectall}')
      cy.get('button').contains('comment').eq(0).click()
      cy.get('.editor-1 .ProseMirror').type('{end}')
      cy.get('.ProseMirror .annotation').should('have.length', 2)
      cy.get('.comment').should('exist').contains('This is a test comment')
    })
  }) */

  /* it('updates an existing annotation', () => {
    let commentIndex = 0

    cy.window().then(win => {
      cy.stub(win, 'prompt', () => {
        switch (commentIndex) {
          case 0:
            commentIndex += 1
            return 'This is a test comment'

          case 1:
            commentIndex += 1
            return 'This is the new comment'

          default:
            return ''
        }
      })

      cy.get('.editor-1 .ProseMirror').type('{selectall}{backspace}Hello world{selectall}')
      cy.get('button').contains('comment').eq(0).click()
      cy.wait(1000)
      cy.get('.editor-1 .ProseMirror').find('.annotation').click()
      cy.get('.comment').should('exist').contains('This is a test comment')
      cy.get('button').contains('update').click()
      cy.wait(1000)
      cy.get('.comment').should('exist').contains('This is the new comment')
    })
  }) */

  /* it('deletes an existing annotation', () => {
    cy.window().then(win => {
      cy.stub(win, 'prompt', () => 'This is a test comment')

      cy.get('.editor-1 .ProseMirror').type('{selectall}{backspace}Hello world{selectall}')
      cy.get('button').contains('comment').eq(0).click()
      cy.wait(1000)
      cy.get('.editor-1 .ProseMirror').find('.annotation').click()
      cy.get('.comment').should('exist').contains('This is a test comment')
      cy.get('button').contains('remove').click()
      cy.get('.ProseMirror .annotation').should('not.exist')
      cy.wait(1000)
      cy.get('.comment').should('not.exist')
    })
  }) */
})
