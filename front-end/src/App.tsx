import {Route, Routes} from 'react-router-dom';

import {RecordPage} from './Pages/RecordPage/RecordPage';

import './App.scss';
import {DownloadPage} from './Pages/DownloadPage/DownloadPage';

function App() {
  return (
    <div className="app">
      <div className="app__inner">
        <Routes>
          <Route path="/" element={<RecordPage />} />
          <Route path="download" element={<DownloadPage />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
