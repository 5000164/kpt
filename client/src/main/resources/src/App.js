import React, {Component} from 'react';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      result: 'result',
    };
  }

  handleClick(input) {
    const myWorker = new Worker('client-fastopt.js');
    myWorker.postMessage(input);
    myWorker.onmessage = e => {
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
