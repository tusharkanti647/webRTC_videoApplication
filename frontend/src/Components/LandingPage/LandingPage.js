import "./LandingPage.css";
import { Link, useNavigate } from "react-router-dom";

import { Button, TextField } from '@mui/material';
import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { useSocket } from "../../socket/SocketProvider";

export default function LandingPage() {
    let navigate = useNavigate();

    const socket = useSocket()


    const [isAuthenticated, setIsAuthenticated] = useState('loading')
    const [meetingCode, setMeetingCode] = useState("");
    const [isShowCreateRome, setIsShowCreateRome] = useState(false);
    const [emailValue, setEmailValue] = useState('')
    const [inviteEmails, setInviteEmails] = useState([])
    const [romeDetails, setRomeDetails] = useState({ romeId: '', joinUrl: '' }
    )





    //join a video call
    const handleJoinVideoCall = () => {
        socket.emit('check-rome', { romeId: meetingCode })
    }

    //check is user is login or not
    useEffect(() => {

        const checkAuthentication = async () => {
            try {
                await new Promise((resolve, reject) => setTimeout(resolve, 200))
                const response = await fetch(process.env.REACT_APP_API_HOST + '/userApi/authCheck', {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    credentials: "include",
                });
                let data = await response.json();
                console.log('data1', data);
                if (response.status == '200') {
                    if (data.authenticated) {
                        setIsAuthenticated('authenticated');
                        sessionStorage.setItem('userId', data.user)
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
        }

        checkAuthentication();
    }, [])

    const handleAddEmail = () => {
        if (!emailValue.trim()) {
            return
        }

        setInviteEmails([...inviteEmails, emailValue])
        setEmailValue('')
    }

    //post to the server to generate the rome link
    //only login user can generate the link
    const handelGenerateLink = async () => {
        try {

            const response = await axios.post(
                "http://localhost:8000/roomsApi/create",
                {
                    inviteEmails: inviteEmails,
                },
                {
                    withCredentials: true,
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );

            console.log("Room created successfully:", response, response.data);

            if (response.status == 200) {
                const { romeId, joinUrl } = response.data;
                setRomeDetails({ romeId, joinUrl })
            } else {
                alert('some thing with wrong, tray again')
            }

        } catch (error) {
            console.error("Create room failed:", error);
            alert('some thing with wrong, tray again')
            if (error.response) {
                console.error("Server response:", error.response.data);
            } else {
                console.error("Network error or server not reachable");
            }
        }
    };

    //socket all events
    useEffect(() => {
        console.log('HHHHHH123', socket)
        const isRomePresent = (data) => {
            console.log('KKKKKK', data)
            if (data.status) {
                navigate(`/join/${meetingCode}`);
            } else {
                alert('This rome is not live now.')
            }
        }
        if (socket) {
            socket.on('check-rome', isRomePresent)
        }

        return (() => {
            if (socket) {
                socket.off('check-rome', isRomePresent)
            }
        })
    }, [socket, meetingCode])

    //screen show the loading
    if (isAuthenticated == 'loading') {
        return <div style={{
            height: '100vh',
            width: '100vw',
            fontWeight: 'bold',
            display: "flex",
            justifyContent: "center",
            alignItems: 'center',
            background: 'rgb(62, 63, 63,0.5)'
        }}>
            Loading.....
        </div>
    }
    //screen show the error message if any happyn
    if (isAuthenticated == 'serverError') {
        return <div style={{
            height: '100vh',
            width: '100vw',
            fontWeight: 'bold',
            display: "flex",
            justifyContent: "center",
            alignItems: 'center',
            background: 'rgb(62, 63, 63,0.5)'
        }}>
            Internal Server Error. Please reload the page or try again some time later...
        </div>
    }

    return (
        <div className="LandingPageContainer">
            <nav>
                <div className="navHeader">
                    <h2>Video Call App</h2>
                </div>
                <div className="navList">


                    <div
                        onClick={() => {
                            navigate("/SignUp");
                        }}
                        role="button"
                    >
                        <p>SignUp</p>
                    </div>
                </div>
            </nav>

            <div className="landingMainContainer">
                <div>
                    <h1>
                        <span style={{ color: "#007bff" }}>Connect</span> with your loved
                        once
                    </h1>
                    <p>Cover a distance by Video Call App</p>
                    <div style={{ width: '100%', display: 'flex', justifyContent: "space-around", alignItems: 'center' }}>
                        {isShowCreateRome ? <>
                            <div>
                                <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
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

                                <div >
                                    {inviteEmails.map((ele) => <p key={ele}>{ele}</p>)}
                                </div>
                            </div>
                            <div>
                                <div role="button" onClick={handelGenerateLink}>
                                    Generate Link
                                </div>


                            </div>
                        </> :
                            <>

                                {isAuthenticated == 'NotAuthenticated' ? <div role="button">
                                    <Link to={"/SignIn"}>Login</Link>
                                </div> : <div
                                    onClick={() => setIsShowCreateRome(true)}
                                    role="button"
                                >
                                    <p>Create a Rome</p>
                                </div>}

                                {/* rome joining  section*/}
                                <div>
                                    <h2>Join a rome</h2>

                                    <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
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
                            </>}
                    </div>


                    {/* show the romeid and joinurl */}
                    <div style={{ fontSize: '15px', }}>
                        {romeDetails?.joinUrl && <div
                            style={{ color: "white", fontSize: '20px', width: '100px', textAlign: 'center', cursor: 'pointer' }}


                            onClick={() => {
                                console.log('MMMM', process.env.REACT_APP_BASE_LINK)
                                navigate(`/join/${romeDetails.romeId}`)
                            }}
                            role="button"
                        >
                            <p>Join</p>
                        </div>}
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