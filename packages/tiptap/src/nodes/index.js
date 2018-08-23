import Blockquote from './Blockquote'
import BulletList from './BulletList'
import CodeBlock from './CodeBlock'
import Doc from './Doc'
import HardBreak from './HardBreak'
import Heading from './Heading'
import ListItem from './ListItem'
import OrderedList from './OrderedList'
import Paragraph from './Paragraph'
import Text from './Text'
import TodoList from './TodoList'
import TodoItem from './TodoItem'

export default [
	// essentials
	new Doc(),
	new Paragraph(),
	new Text(),

	new Blockquote(),
	new CodeBlock(),
	new Heading({ maxLevel: 3 }),
	new HardBreak(),
	new OrderedList(),
	new BulletList(),
	new ListItem(),
	new TodoList(),
	new TodoItem(),
]
