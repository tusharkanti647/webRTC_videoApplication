// import logo from './logo.svg';
import './App.css';
import { Route, Router, Routes } from 'react-router';
// import Quiz from './Components/quiz/Quiz';
// import Dashboard from './Components/dashboard/Dashboard';
import NoteFoundPage from './Components/NotFoundPage';
// import SignUp from './Components/loginSignup/SIgnUp';
import SignUp from './Components/loginSignup/SignUp';
import Lobby from './Components/Lobby';
import Rome from './Components/Roome/Rome';
import LandingPage from './Components/LandingPage/LandingPage';
import VideoMeetComponent from './Components/Roome/Rome';
// import SubmittedPage from './Components/SubmittedPage';
// import Cookies from 'js-cookie';
// import PrivateRoute from './Components/loginSignup/PrivateRoute';



function App() {

  return (
    <div className="App">
      <Routes>
        {/* <Route path="/" element={<PrivateRoute > <Dashboard /></PrivateRoute>} /> */}
        <Route path='/SignUp' element={<SignUp />} />
        <Route path='/SignIn' element={<SignUp />} />
        {/* <Route path='/join' element={<Lobby />} />
        <Route path='/rome/:romeId' element={<Rome />} /> */}


        <Route path="/" element={<LandingPage />} />
        {/* <Route path="/auth" element={<Authentiation />} /> */}
        {/* <Route path="/home" element={<Home />} /> */}
        {/* <Route path="/history" element={<History />} /> */}
        <Route path="/join/:romeId" element={<VideoMeetComponent />} />

        {/* <Route path='/Quiz' element={<PrivateRoute><Quiz /></PrivateRoute>} /> */}
        {/* <Route path='/SubmittedPage' element={<PrivateRoute  ><SubmittedPage /></PrivateRoute>} /> */}
        <Route path='*' element={<NoteFoundPage />} />

      </Routes>

    </div>
  );
}

export default App;
