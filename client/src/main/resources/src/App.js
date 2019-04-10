import React, {Component} from 'react';
import {proto} from './modules/bundle';
import styled, {createGlobalStyle} from 'styled-components';

const GlobalStyle = createGlobalStyle`
  body {
    margin: 0;
  }
`

class Board extends Component {
  constructor(props) {
    super(props);
    this.state = {
      groups: {
        keep: [''],
        problem: [''],
        try: [''],
      },
    };
    this.handleChange = this.handleChange.bind(this);
  }

  componentDidMount() {
    this.worker = new Worker('worker.js');
    this.worker.onmessage = e => {
      const groups = proto.client.Groups.decode(e.data);
      this.setState({groups: groups});
    }
  }

  componentWillUnmount() {
    this.worker.terminate();
  }

  handleChange(event, name, i) {
    const groups = this.state.groups;
    const values = groups[name].slice();
    values[i] = event.target.value;
    groups[name] = values;
    this.setState({groups: groups});

    const message = proto.client.Groups.create({keep: groups.keep, problem: groups.problem, try: groups.try});
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
          <Group name={'keep'} value={this.state.groups['keep']} handleChange={this.handleChange}/>
          <Group name={'problem'} value={this.state.groups['problem']} handleChange={this.handleChange}/>
          <Group name={'try'} value={this.state.groups['try']} handleChange={this.handleChange}/>
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
        <h1>{this.props.name}</h1>
        <InputField value={this.props.value} handleChange={(e) => this.props.handleChange(e, this.props.name, 0)}/>
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
