import React, {Component} from 'react';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      input: '',
      result: '',
    };
  }

  componentDidMount() {
    this.worker = new Worker('worker.js');
    this.worker.onmessage = e => {
      this.setState({result: e.data});
    }
  };

  componentWillUnmount() {
    this.worker.terminate();
  }

  handleChange = (event) => {
    this.setState({input: event.target.value});
  }

  handleClick = () => {
    this.worker.postMessage(this.state.input);
  }

  render() {
    return (
      <>
        <input type="text" value={this.state.input} onChange={this.handleChange}/>
        <div onClick={this.handleClick}>送信</div>
        <div>{this.state.result}</div>
      </>
    );
  }
}

export default App;
