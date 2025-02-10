context('/src/Nodes/Youtube/Vue/', () => {
  before(() => {
    cy.visit('/src/Nodes/Youtube/Vue/')
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
        .invoke('attr', 'src')
        .then(src => {
          const url = new URL(src)

          expect(`${url.origin}${url.pathname}`).to.eq('https://www.youtube-nocookie.com/embed/hBp4dgE7Bho')
          expect([...url.searchParams.keys()]).to.have.members(['controls', 'rel'])
          expect(url.searchParams.get('controls')).to.eq('0')
          expect(url.searchParams.get('rel')).to.eq('1')
        })
    })
  })

  it('adds a video with 320 width and 240 height', () => {
    cy.window().then(win => {
      cy.stub(win, 'prompt', () => 'https://music.youtube.com/watch?v=hBp4dgE7Bho&feature=share')
      cy.get('#width').type('{selectall}{backspace}320')
      cy.get('#height').type('{selectall}{backspace}240')
      cy.get('#add').eq(0).click()
      cy.get('.tiptap div[data-youtube-video] iframe').should('have.length', 1)
        .should('have.css', 'width', '320px')
        .should('have.css', 'height', '240px')
        .invoke('attr', 'src')
        .then(src => {
          const url = new URL(src)

          expect(`${url.origin}${url.pathname}`).to.eq('https://www.youtube-nocookie.com/embed/hBp4dgE7Bho')
          expect([...url.searchParams.keys()]).to.have.members(['controls', 'rel'])
          expect(url.searchParams.get('controls')).to.eq('0')
          expect(url.searchParams.get('rel')).to.eq('1')
        })
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
        .invoke('attr', 'src')
        .then(src => {
          const url = new URL(src)

          expect(`${url.origin}${url.pathname}`).to.eq('https://www.youtube-nocookie.com/embed/hBp4dgE7Bho')
          expect([...url.searchParams.keys()]).to.have.members(['controls', 'rel'])
          expect(url.searchParams.get('controls')).to.eq('0')
          expect(url.searchParams.get('rel')).to.eq('1')
        })

      cy.get('.tiptap div[data-youtube-video] iframe')
        .click()

      cy.get('#add').eq(0).click()

      cy.get('.tiptap div[data-youtube-video] iframe')
        .should('have.length', 1)
        .invoke('attr', 'src')
        .then(src => {
          const url = new URL(src)

          expect(`${url.origin}${url.pathname}`).to.eq('https://www.youtube-nocookie.com/embed/wRakoMYVHm8')
          expect([...url.searchParams.keys()]).to.have.members(['controls', 'rel'])
          expect(url.searchParams.get('controls')).to.eq('0')
          expect(url.searchParams.get('rel')).to.eq('1')
        })
    })
  })
})
