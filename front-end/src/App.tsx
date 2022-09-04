import './App.css';
import {VideoRecord} from './Components/VideoRecord/VideoRecord';
import {VideoStream} from './Components/VideoStream/VideoStream';

function App() {
  return (
    <div className="App">
      <VideoRecord />
      <VideoStream />
    </div>
  );
}

export default App;
