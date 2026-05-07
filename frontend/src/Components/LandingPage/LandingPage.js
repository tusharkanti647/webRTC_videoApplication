import './LandingPage.css';
import { Link, useNavigate } from 'react-router-dom';

import { Button, TextField } from '@mui/material';
import { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { useSocket } from '../../socket/SocketProvider';

export default function LandingPage() {
  const navigate = useNavigate();

  const socket = useSocket();

  const [isAuthenticated, setIsAuthenticated] = useState('loading');
  const [meetingCode, setMeetingCode] = useState('');
  const [isShowCreateRome, setIsShowCreateRome] = useState(false);
  const [emailValue, setEmailValue] = useState('');
  const [romeValue, setRomeValue] = useState('');
  const [inviteEmails, setInviteEmails] = useState([]);
  const [date, setDate] = useState(null);
  const [time, setTime] = useState(null);
  const [romeDetails, setRomeDetails] = useState({ romeId: '', joinUrl: '' });

  //join a video call
  const handleJoinVideoCall = () => {
    console.log('HHHHHHHHHH123');
    socket.emit('check-rome', { romeId: meetingCode });
  };

  //check is user is login or not
  useEffect(() => {
    const checkAuthentication = async () => {
      try {
        await new Promise((resolve, reject) => setTimeout(resolve, 200));
        const response = await fetch(process.env.REACT_APP_API_HOST + '/userApi/authCheck', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        });
        const data = await response.json();
        console.log('data1', data);
        if (response.status == '200') {
          if (data.authenticated) {
            setIsAuthenticated('authenticated');
            sessionStorage.setItem('userId', data.user);
          } else {
            setIsAuthenticated('NotAuthenticated');
          }
        } else if (response.status == '500') {
          setIsAuthenticated('serverError');
          // setIsServerError(true)
        } else {
          setIsAuthenticated('NotAuthenticated');
        }
      } catch (e) {
        console.log('ERROR', e);
        setIsAuthenticated('NotAuthenticated');
      }
    };

    checkAuthentication();
  }, []);

  const handleAddEmail = () => {
    if (!emailValue.trim()) {
      return;
    }

    setInviteEmails([...inviteEmails, emailValue]);
    setEmailValue('');
  };

  const validateDateTime = (dateValue, timeValue) => {
    if (!dateValue || !timeValue) {
      return { valid: true, message: 'no time', startTime: null };
    }

    const [year, month, day] = dateValue.split('-');
    const [hour, minute] = timeValue.split(':');

    const selected = new Date(year, month - 1, day, hour, minute);
    const now = new Date();

    if (selected < now) {
      return { valid: false, message: 'Past date/time not allowed' };
    }
    return { valid: true, message: 'Valid date & time', startTime: selected };
  };
  //post to the server to generate the rome link
  //only login user can generate the link
  const handelGenerateLink = async () => {
    try {
      const validetor = validateDateTime(date, time);
      if (!validetor.valid) {
        alert('invalid date and time less time from current time');
        return;
      }
      const myUrl = process.env.REACT_APP_API_HOST + '/roomsApi/create';

      const response = await axios.post(
        myUrl,
        // "http://localhost:8000/roomsApi/create",
        {
          romeName: romeValue,
          participants: inviteEmails,
          // description: ,
          startTime: validetor.startTime,
          // endTime: z.string().datetime().optional(),
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );

      console.log('Room created successfully:', response, response.data);

      if (response.status == 201) {
        const { romeId, joinUrl } = response.data.data;
        setRomeDetails({ romeId, joinUrl });
      } else {
        alert('some thing with wrong, tray again');
      }
    } catch (error) {
      console.error('Create room failed:', error);
      alert('some thing with wrong, tray again');
      if (error.response) {
        console.error('Server response:', error.response.data);
      } else {
        console.error('Network error or server not reachable');
      }
    }
  };

  //handel user logout
  const handelLogOut = async () => {
    const url = process.env.REACT_APP_API_HOST + '/userApi/signOut';
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      const data = await response.json();
      console.log(data);
      if (response.status == '200') {
        navigate('/SignIn');
      } else if (response.status == '500') {
        alert('Internal Server Error. please try again.');
      } else {
        alert('something went wrong. please try again.');
      }
    } catch (e) {
      console.log('ERROR', e);
    }
  };

  //socket all events
  useEffect(() => {
    console.log('HHHHHH123', socket);
    const isRomePresent = (data) => {
      console.log('KKKKKK', data);
      if (data.status) {
        navigate(`/join/${meetingCode}`);
      } else {
        alert('This rome is not live now.');
      }
    };
    if (socket) {
      socket.on('check-rome', isRomePresent);
    }

    return () => {
      if (socket) {
        socket.off('check-rome', isRomePresent);
      }
    };
  }, [socket, meetingCode]);

  //screen show the loading
  if (isAuthenticated == 'loading') {
    return (
      <div
        style={{
          height: '100vh',
          width: '100vw',
          fontWeight: 'bold',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          background: 'rgb(62, 63, 63,0.5)',
        }}
      >
        Loading.....
      </div>
    );
  }
  //screen show the error message if any happyn
  if (isAuthenticated == 'serverError') {
    return (
      <div
        style={{
          height: '100vh',
          width: '100vw',
          fontWeight: 'bold',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          background: 'rgb(62, 63, 63,0.5)',
        }}
      >
        Internal Server Error. Please reload the page or try again some time later...
      </div>
    );
  }

  return (
    <div className="LandingPageContainer">
      <nav>
        <div className="navHeader">
          <h2>Video Call App</h2>
        </div>
        <div className="navList">
          {isAuthenticated == 'NotAuthenticated' ? (
            <div
              onClick={() => {
                navigate('/SignUp');
              }}
              role="button"
            >
              <p>SignUp</p>
            </div>
          ) : (
            <div
              onClick={() => {
                handelLogOut();
              }}
              role="button"
            >
              <p>Logout</p>
            </div>
          )}
        </div>
      </nav>

      <div className="landingMainContainer">
        <div>
          <h1>
            <span style={{ color: '#007bff' }}>Video</span> meetings made simple
          </h1>
          <p>Connect teams and collaborate from anywhere</p>
          <div
            style={{
              width: '100%',
              display: 'flex',
              justifyContent: 'space-around',
              alignItems: 'center',
            }}
          >
            {isShowCreateRome ? (
              <>
                <div>
                  <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                    <TextField
                      onChange={(e) => setRomeValue(e.target.value)}
                      id="outlined-basic"
                      label="Enter Rome Name"
                      variant="outlined"
                      value={romeValue}
                    />
                    <TextField
                      label="Select Date"
                      type="date"
                      InputLabelProps={{ shrink: true }}
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      // error={!!error}
                    />

                    <TextField
                      label="Select Time"
                      type="time"
                      InputLabelProps={{ shrink: true }}
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      // error={!!error}
                      // helperText={error}
                    />

                    <TextField
                      onChange={(e) => setEmailValue(e.target.value)}
                      id="outlined-basic"
                      label="Enter One Invite Email"
                      variant="outlined"
                      value={emailValue}
                    />
                    <Button onClick={handleAddEmail} variant="contained">
                      Add Email
                    </Button>
                  </div>

                  <div>
                    {inviteEmails.map((ele) => (
                      <p key={ele}>{ele}</p>
                    ))}
                  </div>
                </div>
                <div>
                  <Button
                    role="button"
                    sx={{ height: '45px' }}
                    onClick={handelGenerateLink}
                    variant="contained"
                  >
                    Generate Link
                  </Button>
                </div>
              </>
            ) : (
              <>
                {isAuthenticated == 'NotAuthenticated' ? (
                  <div role="button">
                    <Link to={'/SignIn'}>Login</Link>
                  </div>
                ) : (
                  <Button
                    onClick={() => setIsShowCreateRome(true)}
                    variant="contained"
                    className="createRomeBtn"
                  >
                    <p>Create a Rome</p>
                  </Button>
                )}

                {/* rome joining  section*/}
                <div>
                  <h4>Join a rome</h4>

                  <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                    <TextField
                      onChange={(e) => setMeetingCode(e.target.value)}
                      id="outlined-basic"
                      label="Enter rome id"
                      variant="outlined"
                      value={meetingCode}
                    />
                    <Button onClick={handleJoinVideoCall} variant="contained">
                      Join
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* show the romeid and joinurl */}
          <div style={{ fontSize: '15px', marginTop: '20px' }}>
            {romeDetails?.joinUrl && (
              <Button
                onClick={() => {
                  console.log('MMMM', process.env.REACT_APP_BASE_LINK);
                  navigate(`/join/${romeDetails.romeId}`);
                }}
                variant="contained"
              >
                Join
              </Button>
            )}
            {romeDetails?.romeId && <p>RomeId: {romeDetails?.romeId}</p>}
            {romeDetails?.joinUrl && <p>JoinUrl: {romeDetails?.joinUrl}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}

// RomeId: 697dd4c865838c93fccd3e98

// JoinUrl: http://localhost:3000/join/697dd4c865838c93fccd3e98
