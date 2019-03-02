import React, {Component} from 'react';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
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

  handleClick(input) {
    this.worker.postMessage(input);
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
