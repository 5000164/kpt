import React, { Component } from "react"
import { proto } from "./modules/bundle"
import styled, { createGlobalStyle } from "styled-components"

class Board extends Component {
  constructor(props) {
    super(props)
    this.state = {
      contents: {
        keep: [""],
        problem: [""],
        try: [""],
      },
    }
    this.handleChange = this.handleChange.bind(this)
    this.handleKeyDown = this.handleKeyDown.bind(this)
    this.handleClick = this.handleClick.bind(this)
    this.handleClickSave = this.handleClickSave.bind(this)
    this.handleClickLoad = this.handleClickLoad.bind(this)
    this.handleClickExport = this.handleClickExport.bind(this)
  }

  componentDidMount() {
    this.worker = new Worker("worker.js")
    this.worker.onmessage = e => {
      const behavior = proto.Behavior.decode(e.data[0])
      if (behavior.behavior === proto.Behavior.Behavior.UPDATE) {
        const contents = proto.Contents.decode(e.data[1])
        this.setState({ contents })
      } else if (behavior.behavior === proto.Behavior.Behavior.SAVE) {
        console.log("success to save")
      } else if (behavior.behavior === proto.Behavior.Behavior.LOAD) {
        const contents = proto.Contents.decode(e.data[1])
        this.setState({ contents })
      }
    }
  }

  componentWillUnmount() {
    this.worker.terminate()
  }

  handleChange(event, name, i) {
    const contents = this.state.contents
    const values = contents[name].slice()
    values[i] = event.target.value
    contents[name] = values
    this.setState({ contents: contents })
  }

  handleKeyDown(event, name) {
    if (event.keyCode === 13) {
      const contents = this.state.contents
      const values = contents[name]
      values.push("")
      contents[name] = values
      this.setState({ contents })

      const protoBehavior = proto.Behavior.create({
        behavior: proto.Behavior.Behavior.UPDATE,
      })
      const protoContents = proto.Contents.create({
        keep: contents.keep,
        problem: contents.problem,
        try: contents.try,
      })
      const behavior = new Uint8Array(proto.Behavior.encode(protoBehavior).finish())
      const data = new Uint8Array(proto.Contents.encode(protoContents).finish())
      this.worker.postMessage(
        {
          behavior,
          data,
        },
        [behavior.buffer, data.buffer]
      )
    }
  }

  handleClick(event, name, i) {
    const contents = this.state.contents
    const values = contents[name]
    values.splice(i, 1)
    contents[name] = values
    this.setState({ contents })

    const protoBehavior = proto.Behavior.create({
      behavior: proto.Behavior.Behavior.UPDATE,
    })
    const protoContents = proto.Contents.create({
      keep: contents.keep,
      problem: contents.problem,
      try: contents.try,
    })
    const behavior = new Uint8Array(proto.Behavior.encode(protoBehavior).finish())
    const data = new Uint8Array(proto.Contents.encode(protoContents).finish())
    this.worker.postMessage(
      {
        behavior,
        data,
      },
      [behavior.buffer, data.buffer]
    )
  }

  handleClickExport() {
    const contents = this.state.contents
    const keepContents = "- " + contents.keep.join("\n- ")
    const problemContents = "- " + contents.problem.join("\n- ")
    const tryContents = "- " + contents.try.join("\n- ")
    const serialized = `# Keep\n\n${keepContents}\n\n# Problem\n\n${problemContents}\n\n# Try\n\n${tryContents}`

    const textarea = document.createElement("textarea")
    textarea.textContent = serialized
    const body = document.getElementsByTagName("body")[0]
    body.appendChild(textarea)
    textarea.select()
    document.execCommand("copy")
    body.removeChild(textarea)
  }

  handleClickSave() {
    const contents = this.state.contents
    const protoBehavior = proto.Behavior.create({
      behavior: proto.Behavior.Behavior.SAVE,
    })
    const protoContents = proto.Contents.create({
      keep: contents.keep,
      problem: contents.problem,
      try: contents.try,
    })
    const behavior = new Uint8Array(proto.Behavior.encode(protoBehavior).finish())
    const data = new Uint8Array(proto.Contents.encode(protoContents).finish())
    this.worker.postMessage(
      {
        behavior,
        data,
      },
      [behavior.buffer, data.buffer]
    )
  }

  handleClickLoad() {
    const protoBehavior = proto.Behavior.create({
      behavior: proto.Behavior.Behavior.LOAD,
    })
    const behavior = new Uint8Array(proto.Behavior.encode(protoBehavior).finish())
    this.worker.postMessage({ behavior }, [behavior.buffer])
  }

  render() {
    return (
      <>
        <GlobalStyle />
        <Wrapper>
          <Group
            name={"keep"}
            value={this.state.contents["keep"]}
            handleChange={this.handleChange}
            handleKeyDown={this.handleKeyDown}
            handleClick={this.handleClick}
          />
          <Group
            name={"problem"}
            value={this.state.contents["problem"]}
            handleChange={this.handleChange}
            handleKeyDown={this.handleKeyDown}
            handleClick={this.handleClick}
          />
          <Group
            name={"try"}
            value={this.state.contents["try"]}
            handleChange={this.handleChange}
            handleKeyDown={this.handleKeyDown}
            handleClick={this.handleClick}
          />
        </Wrapper>
        <div onClick={this.handleClickSave}>Save</div>
        <div onClick={this.handleClickLoad}>Load</div>
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
