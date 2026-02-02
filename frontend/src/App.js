
import './App.css';
import { Route, Router, Routes } from 'react-router';
import NoteFoundPage from './Components/NotFoundPage';
import SignUp from './Components/loginSignup/SignUp';
import LandingPage from './Components/LandingPage/LandingPage';
import VideoMeetComponent from './Components/Roome/Rome';




function App() {

  return (
    <div className="App">
      <Routes>
        <Route path='/SignUp' element={<SignUp />} />
        <Route path='/SignIn' element={<SignUp />} />

        <Route path="/" element={<LandingPage />} />
        <Route path="/join/:romeId" element={<VideoMeetComponent />} />

        <Route path='*' element={<NoteFoundPage />} />
      </Routes>

    </div>
  );
}

export default App;
