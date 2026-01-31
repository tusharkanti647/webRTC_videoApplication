import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { BrowserRouter } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { SocketProvider } from './socket/SocketProvider';

const root = ReactDOM.createRoot(document.getElementById('root'));
const GOOGLE_CLIENT_ID = '802272216417-n0hm3nmlafpvl8sca9tpt4u4vkmjrfmf.apps.googleusercontent.com'
const GOOGLE_SECRET = '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'
// console.log(GOOGLE_CLIENT_ID)
root.render(
  <React.StrictMode >
    <BrowserRouter>
      <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
        {/* <SocketProvider> */}
        <App />
        {/* </SocketProvider> */}
      </GoogleOAuthProvider>
    </BrowserRouter>

  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
