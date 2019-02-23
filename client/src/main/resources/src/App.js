import React, {Component} from 'react';

class App extends Component {
  render() {
    const myWorker = new Worker('client-fastopt.js');
    myWorker.postMessage('test');
    myWorker.onmessage = function (e) {
      console.log(e.data);
    }

    return (
      <div>App</div>
    );
  }
}

export default App;
