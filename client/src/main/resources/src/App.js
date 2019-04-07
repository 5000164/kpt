import React, {Component} from 'react';
import {proto} from './modules/bundle';
import styled, {createGlobalStyle} from 'styled-components'

const GlobalStyle = createGlobalStyle`
  body {
    margin: 0;
  }
`

class Board extends Component {
  constructor(props) {
    super(props);
    this.state = {
      groups: Array(3).fill(''),
    }
  }

  componentDidMount() {
    this.worker = new Worker('worker.js');
    this.worker.onmessage = e => {
      const groups = proto.client.Groups.decode(e.data);
      // To avoid undefined.
      for (let i = 0; i < 3; i++) groups.content[i] = groups.content[i] || ''
      this.setState({groups: groups.content});
    }
  }

  componentWillUnmount() {
    this.worker.terminate();
  }

  handleChange(event, i) {
    const groups = this.state.groups.slice();
    groups[i] = event.target.value
    this.setState({groups: groups});

    const message = proto.client.Groups.create({content: groups})
    // I make a new object to use transfer.
    // If I don't copy, an error happens in the second time (because of a buffer pool probably).
    // See https://qiita.com/Quramy/items/8c12e6c3ad208c97c99a about performance.
    const data = new Uint8Array(proto.client.Groups.encode(message).finish());
    this.worker.postMessage(data, [data.buffer]);
  }

  render() {
    return (
      <>
        <GlobalStyle/>
        <Wrapper>
          <Group value={this.state.groups[0]} handleChange={(e) => this.handleChange(e, 0)}/>
          <Group value={this.state.groups[1]} handleChange={(e) => this.handleChange(e, 1)}/>
          <Group value={this.state.groups[2]} handleChange={(e) => this.handleChange(e, 2)}/>
        </Wrapper>
      </>
    )
  }
}

const Wrapper = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-gap: 4px;
  margin: 4px;
`;

class Group extends Component {
  constructor(props) {
    super(props);
    this.ref = React.createRef();
  }

  render() {
    return (
      <StyledGroup ref={this.ref}>
        <InputField value={this.props.value} handleChange={this.props.handleChange}/>
      </StyledGroup>
    )
  }
}

const StyledGroup = styled.div`
  width: 100%;
`;

class InputField extends Component {
  render() {
    return (
      <StyledInput type="text" value={this.props.value} onChange={this.props.handleChange}/>
    )
  }
}

const StyledInput = styled.input`
  box-sizing: border-box;
  width: 100%;
`;

export default Board;
