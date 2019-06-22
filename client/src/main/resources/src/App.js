import React, { Component } from "react"
import { proto } from "./modules/bundle"
import styled, { createGlobalStyle } from "styled-components"

class Board extends Component {
  constructor(props) {
    super(props)
    this.state = {
      groups: {
        keep: [""],
        problem: [""],
        try: [""],
      },
    }
    this.handleChange = this.handleChange.bind(this)
    this.handleKeyDown = this.handleKeyDown.bind(this)
    this.handleClick = this.handleClick.bind(this)
    this.handleClickExport = this.handleClickExport.bind(this)
  }

  componentDidMount() {
    this.worker = new Worker("worker.js")
    this.worker.onmessage = e => {
      const groups = proto.client.Groups.decode(e.data)
      this.setState({ groups: groups })
    }
  }

  componentWillUnmount() {
    this.worker.terminate()
  }

  handleChange(event, name, i) {
    const groups = this.state.groups
    const values = groups[name].slice()
    values[i] = event.target.value
    groups[name] = values
    this.setState({ groups: groups })
  }

  handleKeyDown(event, name) {
    if (event.keyCode === 13) {
      const groups = this.state.groups
      const values = groups[name]
      values.push("")
      groups[name] = values
      this.setState({ groups: groups })

      const message = proto.client.Groups.create({ keep: groups.keep, problem: groups.problem, try: groups.try })
      // I make a new object to use transfer.
      // If I don't copy, an error happens in the second time (because of a buffer pool probably).
      // See https://qiita.com/Quramy/items/8c12e6c3ad208c97c99a about performance.
      const data = new Uint8Array(proto.client.Groups.encode(message).finish())
      this.worker.postMessage(data, [data.buffer])
    }
  }

  handleClick(event, name, i) {
    const groups = this.state.groups
    const values = groups[name]
    values.splice(i, 1)
    groups[name] = values
    this.setState({ groups: groups })

    const message = proto.client.Groups.create({ keep: groups.keep, problem: groups.problem, try: groups.try })
    // I make a new object to use transfer.
    // If I don't copy, an error happens in the second time (because of a buffer pool probably).
    // See https://qiita.com/Quramy/items/8c12e6c3ad208c97c99a about performance.
    const data = new Uint8Array(proto.client.Groups.encode(message).finish())
    this.worker.postMessage(data, [data.buffer])
  }

  handleClickExport() {
    const groups = this.state.groups
    const keepContents = "- " + groups.keep.join("\n- ")
    const problemContents = "- " + groups.problem.join("\n- ")
    const tryContents = "- " + groups.try.join("\n- ")
    const contents = `# Keep\n\n${keepContents}\n\n# Problem\n\n${problemContents}\n\n# Try\n\n${tryContents}`

    const textarea = document.createElement("textarea")
    textarea.textContent = contents
    const body = document.getElementsByTagName("body")[0]
    body.appendChild(textarea)
    textarea.select()
    document.execCommand("copy")
    body.removeChild(textarea)
  }

  render() {
    return (
      <>
        <GlobalStyle />
        <Wrapper>
          <Group
            name={"keep"}
            value={this.state.groups["keep"]}
            handleChange={this.handleChange}
            handleKeyDown={this.handleKeyDown}
            handleClick={this.handleClick}
          />
          <Group
            name={"problem"}
            value={this.state.groups["problem"]}
            handleChange={this.handleChange}
            handleKeyDown={this.handleKeyDown}
            handleClick={this.handleClick}
          />
          <Group
            name={"try"}
            value={this.state.groups["try"]}
            handleChange={this.handleChange}
            handleKeyDown={this.handleKeyDown}
            handleClick={this.handleClick}
          />
        </Wrapper>
        <div onClick={this.handleClickExport}>Export</div>
      </>
    )
  }
}

const GlobalStyle = createGlobalStyle`
  body {
    margin: 0;
  }
`

const Wrapper = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-gap: 4px;
  margin: 4px;
`

class Group extends Component {
  constructor(props) {
    super(props)
    this.ref = React.createRef()
  }

  render() {
    return (
      <StyledGroup ref={this.ref}>
        <h1>{this.props.name}</h1>
        {this.props.value.map((content, i) => {
          return (
            <InputField
              key={i}
              value={content}
              handleChange={e => this.props.handleChange(e, this.props.name, i)}
              handleKeyDown={e => this.props.handleKeyDown(e, this.props.name)}
              handleClick={e => this.props.handleClick(e, this.props.name, i)}
            />
          )
        })}
      </StyledGroup>
    )
  }
}

const StyledGroup = styled.div`
  width: 100%;
`

class InputField extends Component {
  render() {
    return (
      <>
        <StyledInput
          type="text"
          value={this.props.value}
          onChange={this.props.handleChange}
          onKeyDown={this.props.handleKeyDown}
        />
        <span onClick={this.props.handleClick}>x</span>
      </>
    )
  }
}

const StyledInput = styled.input`
  box-sizing: border-box;
  width: 95%;
`

export default Board
