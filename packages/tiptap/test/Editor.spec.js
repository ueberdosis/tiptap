import Editor from '../src/Utils/Editor'

test('can create editor', () => {
  const editor = new Editor()

  expect(editor).toBeDefined()
})
