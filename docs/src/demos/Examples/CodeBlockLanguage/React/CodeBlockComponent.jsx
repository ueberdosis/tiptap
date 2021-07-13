import React from 'react'
import { NodeViewWrapper, NodeViewContent } from '@tiptap/react'
import './CodeBlockComponent.scss'

export default class CodeBlockComponent extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      selectedLanguage: props.node.attrs.language,
    }
  }

  render() {
    const { selectedLanguage } = this.state
    const { updateAttributes, extension } = this.props

    return (
      <NodeViewWrapper className="code-block">
        <select contentEditable={false} defaultValue={selectedLanguage} onChange={event => updateAttributes({ language: event.target.value })}>
          <option value="null">
            auto
          </option>
          <option disabled>
            —
          </option>
          {extension.options.lowlight.listLanguages().map((language, index) => (
            <option value={language} key={index}>
              {language}
            </option>
          ))}
        </select>
        <pre><NodeViewContent as="code" /></pre>
      </NodeViewWrapper>
    )
  }
}
