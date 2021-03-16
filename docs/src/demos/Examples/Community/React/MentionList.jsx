import React from 'react'
import './MentionList.scss'

export class MentionList extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      selectedIndex: 0,
    }
  }

  componentDidUpdate(oldProps) {
    if (this.props.items !== oldProps.items) {
      this.setState({
        selectedIndex: 0
      })
    }
  }

  onKeyDown({ event }) {
    if (event.key === 'ArrowUp') {
      this.upHandler()
      return true
    }

    if (event.key === 'ArrowDown') {
      this.downHandler()
      return true
    }

    if (event.key === 'Enter') {
      this.enterHandler()
      return true
    }

    return false
  }

  upHandler() {
    this.setState({
      selectedIndex: ((this.state.selectedIndex + this.props.items.length) - 1) % this.props.items.length
    })
  }

  downHandler() {
    this.setState({
      selectedIndex: (this.state.selectedIndex + 1) % this.props.items.length
    })
  }

  enterHandler() {
    this.selectItem(this.state.selectedIndex)
  }

  selectItem(index) {
    const item = this.props.items[index]

    if (item) {
      this.props.command({ id: item })
    }
  }

  render() {
    return (
      <div className="items">
        {this.props.items.map((item, index) => (
          <button
            className={`item ${index === this.state.selectedIndex ? 'is-selected' : ''}`}
            key={index}
            onClick={() => this.selectItem(index)}
          >
            {item}
          </button>
        ))}
      </div>
    )
  }
}
