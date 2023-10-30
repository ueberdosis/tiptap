context('/src/Nodes/Youtube/React/', () => {
  before(() => {
    cy.visit('/src/Nodes/Youtube/React/')
  })

  beforeEach(() => {
    cy.get('.tiptap').type('{selectall}{backspace}')
  })

  it('adds a video', () => {
    cy.window().then(win => {
      cy.stub(win, 'prompt', () => 'https://music.youtube.com/watch?v=hBp4dgE7Bho&feature=share')
      cy.get('#add').eq(0).click()
      cy.get('.tiptap div[data-youtube-video] iframe')
        .should('have.length', 1)
        .should('have.attr', 'src', 'https://www.youtube.com/embed/hBp4dgE7Bho?controls=0')
    })
  })

  it('adds a video via pasting', () => {
    cy.get('.tiptap').paste({
      pastePayload: 'https://music.youtube.com/watch?v=hBp4dgE7Bho&feature=share',
      pasteType: 'text/plain',
    })
    cy.get('.tiptap div[data-youtube-video] iframe')
      .should('have.length', 1)
      .should('have.attr', 'src', 'https://www.youtube.com/embed/hBp4dgE7Bho?controls=0')
  })

  it('adds a video with 320 width and 240 height', () => {
    cy.window().then(win => {
      cy.stub(win, 'prompt', () => 'https://music.youtube.com/watch?v=hBp4dgE7Bho&feature=share')
      cy.get('#width').type('{selectall}{backspace}320')
      cy.get('#height').type('{selectall}{backspace}240')
      cy.get('#add').eq(0).click()
      cy.get('.tiptap div[data-youtube-video] iframe').should('have.length', 1)
        .should('have.attr', 'src', 'https://www.youtube.com/embed/hBp4dgE7Bho?controls=0')
        .should('have.css', 'width', '320px')
        .should('have.css', 'height', '240px')
    })
  })

  it('replaces a video', () => {
    cy.window().then(win => {
      let runs = 0

      cy.stub(win, 'prompt', () => {
        runs += 1
        if (runs === 1) {
          return 'https://music.youtube.com/watch?v=hBp4dgE7Bho&feature=share'
        }
        return 'https://music.youtube.com/watch?v=wRakoMYVHm8'
      })

      cy.get('#add').eq(0).click()
      cy.get('.tiptap div[data-youtube-video] iframe')
        .should('have.length', 1)
        .should('have.attr', 'src', 'https://www.youtube.com/embed/hBp4dgE7Bho?controls=0')

      cy.get('.tiptap div[data-youtube-video] iframe')
        .click()

      cy.get('#add').eq(0).click()

      cy.get('.tiptap div[data-youtube-video] iframe')
        .should('have.length', 1)
        .should('have.attr', 'src', 'https://www.youtube.com/embed/wRakoMYVHm8?controls=0')
    })
  })

  const invalidLinks = [
    'https://www.youtube.com/',
    'https://www.youtube.com',
    'http://notavalidlinkyoutube.com/watch?v=hBp4dgE7Bho&feature=share',
  ]

  invalidLinks.forEach(url => {
    it(`does not add a video with invalid url ${url}`, () => {
      cy.window().then(win => {
        cy.stub(win, 'prompt', () => url)
        cy.get('#add').eq(0).click()
        cy.get('.tiptap div[data-youtube-video] iframe').should('have.length', 0)
      })
    })

    it(`does not add a video with invalid via pasting url ${url}`, () => {
      cy.get('.tiptap').paste({
        pastePayload: url,
        pasteType: 'text/plain',
      })
      cy.get('.tiptap div[data-youtube-video] iframe').should('have.length', 0)
    })
  })
})
