import React, { Component, Fragment } from 'react';
import analyzer from './analyzer';
import { colorAnalyzer } from './analyzer/types';
import testVideoUrl from './videos/caminandes.mp4';

const analyze = options => analyzer(testVideoUrl, [colorAnalyzer], options);

const ColorPatch = ({ color }) => (
  <div
    style={{
      display: 'inline-block',
      backgroundColor: `rgb(${color})`,
      width: 20,
      height: 20,
    }}
  />
);

class App extends Component {
  state = {
    isAnalyzing: false,
    isCancelling: false,
    result: null,
  };

  analysis = null;

  onProgress = result => {
    this.setState({ result });
    console.log(result);
  };

  onFinished = result => {
    this.setState({ isAnalyzing: false, result });
    console.log('Finished', result);
  };

  onCancelled = () => {
    this.setState({ isAnalyzing: false, isCancelling: false });
    console.log('Cancelled');
  };

  handleAnalyzeAll = () => {
    this.analysis = analyze({
      callback: this.onProgress,
    });

    this.setState({ isAnalyzing: true });
    this.analysis.then(this.onFinished).catch(this.onCancelled);
  };

  handleAnalyzeFragment = () => {
    this.analysis = analyze({
      from: 20,
      to: 30,
      callback: this.onProgress,
    });

    this.setState({ isAnalyzing: true, result: null });
    this.analysis.then(this.onFinished).catch(this.onCancelled);
  };

  handleCancel = () => {
    if (this.analysis) {
      this.setState({ isCancelling: true });
      this.analysis.cancel();
    }
  };

  render() {
    const { isAnalyzing, isCancelling, result } = this.state;

    return (
      <div className="App">
        <div>
          <button onClick={this.handleAnalyzeAll} disabled={isAnalyzing}>
            All
          </button>
          <button onClick={this.handleAnalyzeFragment} disabled={isAnalyzing}>
            Fragment
          </button>
          <button
            onClick={this.handleCancel}
            disabled={!isAnalyzing || isCancelling}
          >
            Cancel
          </button>
        </div>
        {result && (
          <Fragment>
            <p>Elapsed: {result.elapsedTime} s</p>
            <p>Remaining: {result.timeRemaining} s</p>
            <p>Completed: {result.percentageCompleted}%</p>
            {isAnalyzing &&
              result.data.colors.map((color, index) => (
                <ColorPatch key={index} color={color} />
              ))}
          </Fragment>
        )}
      </div>
    );
  }
}

export default App;
