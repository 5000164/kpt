import React, {Component} from 'react';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      result: 'result',
    };
  }

  componentDidMount() {
    this.worker = new Worker('worker.js');
  };

  componentWillUnmount() {
    this.worker.terminate();
  }

  handleClick(input) {
    this.worker.postMessage(input);
    this.worker.onmessage = e => {
      this.setState({result: e.data});
    }
  }

  render() {
    return (
      <>
        <div onClick={() => this.handleClick(this.state.result)}>実行</div>
        <div>{this.state.result}</div>
      </>
    );
  }
}

export default App;
