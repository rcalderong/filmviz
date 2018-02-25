import React, { Component, Fragment } from 'react';
import analyzer from './analyzer';
import testVideoUrl from './videos/caminandes.mp4';

const formatTime = seconds => {
  const minutes = Math.floor(seconds / 60);
  return minutes > 1 ? `${minutes} minutes` : `${seconds} seconds`;
};

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

const ColorResult = ({ colors }) => (
  <div>
    {colors.map((color, index) => <ColorPatch key={index} color={color} />)}
  </div>
);

const MotionResult = ({ motion }) => {
  const color = motion > 70 ? 'red' : 'green';
  return <div style={{ color }}>Motion: {motion}%</div>;
};

class FramePreview extends React.Component {
  componentDidMount() {
    this.updateCanvas(this.props.imageData);
  }

  componentWillReceiveProps(nextProps) {
    this.updateCanvas(nextProps.imageData);
  }

  shouldComponentUpdate() {
    return false;
  }

  updateCanvas = imageData => {
    const ctx = this.canvas.getContext('2d');
    ctx.putImageData(imageData, 0, 0);
  };

  render() {
    const { imageData: { width, height } } = this.props;

    return (
      <canvas
        ref={domNode => {
          this.canvas = domNode;
        }}
        width={width}
        height={height}
      />
    );
  }
}

class App extends Component {
  state = {
    isAnalyzing: false,
    isCancelling: false,
    result: null,
    duration: null,
  };

  onProgress = result => {
    this.setState({ result });
    console.log(result);
  };

  onFinished = data => {
    this.setState({
      isAnalyzing: false,
      result: null,
      duration: Math.round((new Date() - this.analysisStart) / 1000),
    });
    console.log('Finished', data);
  };

  onErrorOrCancelled = err => {
    this.setState({ isAnalyzing: false, isCancelling: false });
    console.log(err || 'Cancelled');
  };

  analyze = options => {
    this.analysisStart = new Date();
    this.setState({
      isAnalyzing: true,
      result: null,
      duration: null,
    });

    return analyzer(testVideoUrl, options);
  };

  handleAnalyzeAll = () => {
    this.analysis = this.analyze({
      callback: this.onProgress,
    });

    this.analysis.then(this.onFinished).catch(this.onErrorOrCancelled);
  };

  handleAnalyzeFragment = () => {
    this.analysis = this.analyze({
      from: 20,
      to: 30,
      callback: this.onProgress,
    });

    this.analysis.then(this.onFinished).catch(this.onErrorOrCancelled);
  };

  handleCancel = () => {
    if (this.analysis) {
      this.setState({ isCancelling: true });
      this.analysis.cancel();
    }
  };

  render() {
    const { isAnalyzing, isCancelling, result, duration } = this.state;

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
        {duration && <p>Duration: {formatTime(duration)}</p>}
        {result && (
          <Fragment>
            <p>Remaining: {formatTime(result.timeLeft)}</p>
            <p>Completed: {result.percentageCompleted}%</p>
            <FramePreview imageData={result.data.image} />
            {result.data.colors && <ColorResult colors={result.data.colors} />}
            {result.data.motion !== undefined && (
              <MotionResult motion={result.data.motion} />
            )}
          </Fragment>
        )}
      </div>
    );
  }
}

export default App;
