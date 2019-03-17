import React, {Component} from 'react';

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
      this.setState({result: e.data});
    }
  }

  componentWillUnmount() {
    this.worker.terminate();
  }

  handleChange(event, i) {
    const groups = this.state.groups.slice();
    groups[i] = event.target.value
    this.setState({groups: groups});
  }

  handleClick() {
    this.worker.postMessage(this.state.groups);
  }

  render() {
    return (
      <>
        <Group value={this.state.groups[0]} handleChange={(e) => this.handleChange(e, 0)}/>
        <Group value={this.state.groups[1]} handleChange={(e) => this.handleChange(e, 1)}/>
        <Group value={this.state.groups[2]} handleChange={(e) => this.handleChange(e, 2)}/>
        <div onClick={this.handleClick}>送信</div>
        <div>{this.state.groups[0]}</div>
        <div>{this.state.groups[1]}</div>
        <div>{this.state.groups[2]}</div>
      </>
    )
  }
}

class Group extends Component {
  render() {
    return (
      <InputField value={this.props.value} handleChange={this.props.handleChange}/>
    )
  }
}

class InputField extends Component {
  render() {
    return (
      <input type="text" value={this.props.value} onChange={this.props.handleChange}/>
    )
  }
}

export default Board;
