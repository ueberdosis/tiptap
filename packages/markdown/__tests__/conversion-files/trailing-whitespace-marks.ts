export const name = 'Trailing Whitespace in Marks'

// The expected input is the correct markdown output (no spaces inside marks)
export const expectedInput = `**text** continues here

and **more text** here

also *italic text* works

and **bold** *italic* mixed`.trim()

// The JSON content simulates text with trailing/leading spaces inside marks
// which should be moved outside the mark delimiters in the output
export const expectedOutput = {
  type: 'doc',
  content: [
    {
      type: 'paragraph',
      content: [
        { type: 'text', marks: [{ type: 'bold' }], text: 'text' },
        { type: 'text', text: ' continues here' },
      ],
    },
    {
      type: 'paragraph',
      content: [
        { type: 'text', text: 'and ' },
        { type: 'text', marks: [{ type: 'bold' }], text: 'more text' },
        { type: 'text', text: ' here' },
      ],
    },
    {
      type: 'paragraph',
      content: [
        { type: 'text', text: 'also ' },
        { type: 'text', marks: [{ type: 'italic' }], text: 'italic text' },
        { type: 'text', text: ' works' },
      ],
    },
    {
      type: 'paragraph',
      content: [
        { type: 'text', text: 'and ' },
        { type: 'text', marks: [{ type: 'bold' }], text: 'bold' },
        { type: 'text', text: ' ' },
        { type: 'text', marks: [{ type: 'italic' }], text: 'italic' },
        { type: 'text', text: ' mixed' },
      ],
    },
  ],
}

export const extensions = []
