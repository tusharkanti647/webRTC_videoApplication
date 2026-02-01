

import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import styles from "./Rome.module.css";

import { Badge, IconButton, Button, TextField, Avatar } from '@mui/material';
import VideocamIcon from "@mui/icons-material/Videocam";
import VideocamOffIcon from "@mui/icons-material/VideocamOff";
import CallEndIcon from "@mui/icons-material/CallEnd";
import MicIcon from "@mui/icons-material/Mic";
import MicOffIcon from "@mui/icons-material/MicOff";
import ScreenShareIcon from "@mui/icons-material/ScreenShare";
import StopScreenShareIcon from "@mui/icons-material/StopScreenShare";
import ChatIcon from "@mui/icons-material/Chat";
import { useSocket } from "../../socket/SocketProvider";
import MoreVertIcon from '@mui/icons-material/MoreVert';
import axios from "axios";





var connections = {};

const peerConfigConnections = {
    iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
};

export default function VideoMeetComponent() {
    const routeTo = useNavigate();
    const { romeId } = useParams();

    const socket = useSocket()

    const socketIdRef = useRef();
    const localVideoref = useRef();
    const videoRef = useRef([]);

    const [screenAvailable, setScreenAvailable] = useState();

    const [video, setVideo] = useState(true);
    const [audio, setAudio] = useState(true);


    const [askForUsername, setAskForUsername] = useState(true);
    const [username, setUsername] = useState("");

    const [videos, setVideos] = useState([]);
    const [currentUserHost, setCurrentUserHost] = useState(false)
    const [isOpenManu, setIsOpenManu] = useState('')




    //on page load take the user media permisson
    useEffect(() => {
        console.log("HELLO");
        getPermissions();
    }, []);

    // let getDislayMedia = () => {
    //     if (screen) {
    //         if (navigator.mediaDevices.getDisplayMedia) {
    //             navigator.mediaDevices
    //                 .getDisplayMedia({ video: true, audio: true })
    //                 .then(getDislayMediaSuccess)
    //                 .then((stream) => { })
    //                 .catch((e) => console.log(e));
    //         }
    //     }
    // };

    const getPermissions = async () => {
        try {
            // const videoPermission = await navigator.mediaDevices.getUserMedia({
            //     video: true,
            // });
            // if (videoPermission) {
            //     setVideoAvailable(true);
            //     console.log("Video permission granted");
            // } else {
            //     setVideoAvailable(false);
            //     console.log("Video permission denied");
            // }

            // const audioPermission = await navigator.mediaDevices.getUserMedia({
            //     audio: true,
            // });
            // if (audioPermission) {
            //     setAudioAvailable(true);
            //     console.log("Audio permission granted");
            // } else {
            //     setAudioAvailable(false);
            //     console.log("Audio permission denied");
            // }

            if (navigator.mediaDevices.getDisplayMedia) {
                setScreenAvailable(true);
            } else {
                setScreenAvailable(false);
            }
            // console.log('videoAvailable || audioAvailable', videoAvailable, audioAvailable)
            // if (videoAvailable || audioAvailable) {
            const userMediaStream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: true,
            });
            if (userMediaStream) {
                window.localStream = userMediaStream;
                if (localVideoref.current) {
                    localVideoref.current.srcObject = userMediaStream;
                }
            }
            // }
        } catch (error) {
            console.log(error);
        }
    };

    // useEffect(() => {
    //     if (video !== undefined && audio !== undefined) {
    //         getUserMedia();
    //         console.log("SET STATE HAS ", video, audio);
    //     }
    // }, [video, audio]);
    let getMedia = () => {
        // setVideo(videoAvailable);
        // setAudio(audioAvailable);
        // connectToSocketServer();
    };

    let getUserMediaSuccess = (stream) => {
        try {
            window.localStream.getTracks().forEach((track) => track.stop());
        } catch (e) {
            console.log(e);
        }

        window.localStream = stream;
        localVideoref.current.srcObject = stream;

        for (let id in connections) {
            if (id === socketIdRef.current) continue;

            connections[id].addStream(window.localStream);

            connections[id].createOffer().then((description) => {
                console.log(description);
                connections[id]
                    .setLocalDescription(description)
                    .then(() => {
                        socket.emit(
                            "signal",
                            id,
                            JSON.stringify({ sdp: connections[id].localDescription })
                        );
                    })
                    .catch((e) => console.log(e));
            });
        }

        stream.getTracks().forEach(
            (track) =>
            (track.onended = () => {
                setVideo(false);
                setAudio(false);

                try {
                    let tracks = localVideoref.current.srcObject.getTracks();
                    tracks.forEach((track) => track.stop());
                } catch (e) {
                    console.log(e);
                }

                let blackSilence = (...args) =>
                    new MediaStream([black(...args), silence()]);
                window.localStream = blackSilence();
                localVideoref.current.srcObject = window.localStream;

                for (let id in connections) {
                    connections[id].addStream(window.localStream);

                    connections[id].createOffer().then((description) => {
                        connections[id]
                            .setLocalDescription(description)
                            .then(() => {
                                socket.emit(
                                    "signal",
                                    id,
                                    JSON.stringify({ sdp: connections[id].localDescription })
                                );
                            })
                            .catch((e) => console.log(e));
                    });
                }
            })
        );
    };

    let getUserMedia = () => {
        console.log('JJJJJJ', video, audio)
        // if ((video && videoAvailable) || (audio && audioAvailable)) {
        //     navigator.mediaDevices
        //         .getUserMedia({ video: video, audio: audio })
        //         .then(getUserMediaSuccess)
        //         .then((stream) => { })
        //         .catch((e) => console.log(e));
        // } else {
        //     try {
        //         let tracks = localVideoref.current.srcObject.getTracks();
        //         tracks.forEach((track) => track.stop());
        //     } catch (e) { }
        // }


        navigator.mediaDevices
            .getUserMedia({ video: video, audio: audio })
            .then(getUserMediaSuccess)
            .then((stream) => { })
            .catch((e) => console.log(e));

        // else {
        //     try {
        //         let tracks = localVideoref.current.srcObject.getTracks();
        //         tracks.forEach((track) => track.stop());
        //     } catch (e) { }
        // }
    };

    // let getDislayMediaSuccess = (stream) => {
    //     console.log("HERE");
    //     try {
    //         window.localStream.getTracks().forEach((track) => track.stop());
    //     } catch (e) {
    //         console.log(e);
    //     }

    //     window.localStream = stream;
    //     localVideoref.current.srcObject = stream;

    //     for (let id in connections) {
    //         if (id === socketIdRef.current) continue;

    //         connections[id].addStream(window.localStream);

    //         connections[id].createOffer().then((description) => {
    //             connections[id]
    //                 .setLocalDescription(description)
    //                 .then(() => {
    //                     socket.emit(
    //                         "signal",
    //                         id,
    //                         JSON.stringify({ sdp: connections[id].localDescription })
    //                     );
    //                 })
    //                 .catch((e) => console.log(e));
    //         });
    //     }

    //     stream.getTracks().forEach(
    //         (track) =>
    //         (track.onended = () => {
    //             setScreen(false);

    //             try {
    //                 let tracks = localVideoref.current.srcObject.getTracks();
    //                 tracks.forEach((track) => track.stop());
    //             } catch (e) {
    //                 console.log(e);
    //             }

    //             let blackSilence = (...args) =>
    //                 new MediaStream([black(...args), silence()]);
    //             window.localStream = blackSilence();
    //             localVideoref.current.srcObject = window.localStream;

    //             getUserMedia();
    //         })
    //     );
    // };

    let gotMessageFromServer = (fromId, message) => {
        var signal = JSON.parse(message);

        if (fromId !== socketIdRef.current) {
            if (signal.sdp) {
                connections[fromId]
                    .setRemoteDescription(new RTCSessionDescription(signal.sdp))
                    .then(() => {
                        if (signal.sdp.type === "offer") {
                            connections[fromId]
                                .createAnswer()
                                .then((description) => {
                                    connections[fromId]
                                        .setLocalDescription(description)
                                        .then(() => {
                                            socket.emit(
                                                "signal",
                                                fromId,
                                                JSON.stringify({
                                                    sdp: connections[fromId].localDescription,
                                                })
                                            );
                                        })
                                        .catch((e) => console.log(e));
                                })
                                .catch((e) => console.log(e));
                        }
                    })
                    .catch((e) => console.log(e));
            }

            if (signal.ice) {
                connections[fromId]
                    .addIceCandidate(new RTCIceCandidate(signal.ice))
                    .catch((e) => console.log(e));
            }
        }
    };

    const socketUserLeftResponse = (id) => {
        setVideos((videos) => videos.filter((video) => video.socketId !== id));
    }

    const socketUserJoinedResponse = (data) => {
        console.log(data)

        if (!data.status) {
            return
        }

        data.connectionsSocketIds.forEach(({ socketId, userName, hostId, audioEnabled, videoEnabled, isHost }) => {
            console.log('JJJJJ', socketId, userName)



            const socketListId = socketId

            console.log('JJJJJJJJJJJJJJJJ', socketListId, socketIdRef)
            if (socketListId === socketIdRef.current) {
                setCurrentUserHost(isHost)
            }

            connections[socketListId] = new RTCPeerConnection(
                peerConfigConnections
            );
            // Wait for their ice candidate
            connections[socketListId].onicecandidate = function (event) {
                if (event.candidate != null) {
                    socket.emit(
                        "signal",
                        socketListId,
                        JSON.stringify({ ice: event.candidate })
                    );
                }
            };

            // Wait for their video stream
            connections[socketListId].onaddstream = (event) => {
                console.log("BEFORE:", videoRef.current);
                console.log("FINDING ID: ", socketListId);

                let videoExists = videoRef.current.find(
                    (video) => video.socketId === socketListId
                );

                if (videoExists) {
                    console.log("FOUND EXISTING");

                    // Update the stream of the existing video
                    setVideos((videos) => {
                        const updatedVideos = videos.map((video) =>
                            video.socketId === socketListId
                                ? { ...video, stream: event.stream }
                                : video
                        );
                        videoRef.current = updatedVideos;
                        return updatedVideos;
                    });
                } else {
                    // Create a new video
                    console.log("CREATING NEW");
                    let newVideo = {
                        socketId: socketListId,
                        stream: event.stream,
                        autoplay: true,
                        userName: userName,
                        playsinline: true,
                        hostId,
                        audioEnabled,
                        videoEnabled,
                        isHost
                    };

                    setVideos((videos) => {
                        const updatedVideos = [...videos, newVideo];
                        videoRef.current = updatedVideos;
                        return updatedVideos;
                    });
                }
            };

            // Add the local video stream
            if (window.localStream !== undefined && window.localStream !== null) {
                connections[socketListId].addStream(window.localStream);
            } else {
                let blackSilence = (...args) =>
                    new MediaStream([black(...args), silence()]);
                window.localStream = blackSilence();
                connections[socketListId].addStream(window.localStream);
            }
        });

        if (data.newJoinSocketId === socketIdRef.current) {
            for (let id2 in connections) {
                if (id2 === socketIdRef.current) continue;

                try {
                    connections[id2].addStream(window.localStream);
                } catch (e) { }

                connections[id2].createOffer().then((description) => {
                    connections[id2]
                        .setLocalDescription(description)
                        .then(() => {
                            socket.emit(
                                "signal",
                                id2,
                                JSON.stringify({ sdp: connections[id2].localDescription })
                            );
                        })
                        .catch((e) => console.log(e));
                });
            }
        }
    }

    let silence = () => {
        let ctx = new AudioContext();
        let oscillator = ctx.createOscillator();
        let dst = oscillator.connect(ctx.createMediaStreamDestination());
        oscillator.start();
        ctx.resume();
        return Object.assign(dst.stream.getAudioTracks()[0], { enabled: false });
    };
    let black = ({ width = 400, height = 400 } = {}) => {
        let canvas = Object.assign(document.createElement("canvas"), {
            width,
            height,
        });
        canvas.getContext("2d").fillRect(0, 0, width, height);
        let stream = canvas.captureStream();
        return Object.assign(stream.getVideoTracks()[0], { enabled: false });
    };

    let handleVideo = () => {
        if (!video) {
            navigator.mediaDevices
                .getUserMedia({ video: true, audio: audio })
                .then(getUserMediaSuccess)
                .then((stream) => { })
                .catch((e) => console.log(e));

            setVideo(!video);
        } else {
            localVideoref.current.srcObject.getVideoTracks().forEach(track => {
                track.enabled = !track.enabled;
                setVideo(track.enabled);
            });
        }
    }


    let handleAudio = () => {
        if (!audio) {
            navigator.mediaDevices
                .getUserMedia({ video: video, audio: true })
                .then(getUserMediaSuccess)
                .then((stream) => { })
                .catch((e) => console.log(e));

            setAudio(!audio);
        } else {
            localVideoref.current.srcObject.getAudioTracks().forEach(track => {
                track.enabled = !track.enabled;
                setAudio(track.enabled);
            });
        }

    };

    // useEffect(() => {
    //     if (screen !== undefined) {
    //         getDislayMedia();
    //     }
    // }, [screen]);
    // let handleScreen = () => {
    //     setScreen(!screen);
    // };


    //lev the rome
    let handleEndCall = () => {
        socket.emit('tushar', 'tushar')
        try {

            let tracks = localVideoref.current.srcObject.getTracks();
            tracks.forEach((track) => track.stop());
        } catch (e) { }
        routeTo("/");
    };


    const emitSocketRomeJoin = () => {
        const userId = sessionStorage.getItem('userId')
        socket.emit("join-call", { romeId: romeId, userName: username, userId });
        socketIdRef.current = socket.id;
    }

    //connect the rome
    let connect = () => {
        setAskForUsername(false);
        // getMedia();
        getUserMedia();
        emitSocketRomeJoin()
    };


    const handelOpenManu = (videoObj) => {
        if (videoObj.socketId === isOpenManu) setIsOpenManu('')
        else setIsOpenManu(videoObj.socketId)
    }

    //kik the user
    const handleKickUser = async (videoObj) => {
        try {
            // roomId, socketId
            const res = await axios.post(
                `${process.env.REACT_APP_API_HOST}/roomsApi/kick/${romeId}`,
                { socketId: videoObj.socketId },
                {
                    withCredentials: true, // required for isAuthenticated
                }
            );

            console.log("KICK SUCCESS:", res.data);
            alert('Remove user success')
        } catch (error) {
            alert('Remove user failed')
            console.error(
                "KICK FAILED:",
                error.response?.data || error.message
            );
        }
    };

    //response host force kick
    const handelUserForceKick = ({ reason }) => {
        console.log(reason);

        // Close WebRTC
        // if (peerConnection) {
        //     peerConnection.close();
        //     peerConnection = null;
        // }

        localStream?.getTracks().forEach(track => track.stop());

        // Disconnect socket
        socket.disconnect();


        navigate("/");
    }

    //socket events
    useEffect(() => {
        // console.log('JJJJJJJJJ', socket)
        if (socket) {
            socket.on("signal", gotMessageFromServer);
            socket.on("user-left", socketUserLeftResponse);
            socket.on("user-joined", socketUserJoinedResponse);
            socket.on("force-kick", handelUserForceKick);
        }

        return (() => {
            if (socket) {
                socket.off("signal", gotMessageFromServer);
                socket.off("user-left", socketUserLeftResponse);
                socket.off("user-joined", socketUserJoinedResponse);
                socket.off("force-kick", handelUserForceKick);
            }
        })
    }, [socket?.connected])

    return (
        <div>
            {askForUsername === true ? (
                <div>
                    <h2>Enter into Rome </h2>
                    <TextField
                        id="outlined-basic"
                        label="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        variant="outlined"
                    />
                    <Button variant="contained" onClick={connect}>
                        Connect
                    </Button>

                    <div style={{ height: '400px', width: '400px' }}>
                        <video width={'400px'} ref={localVideoref} autoPlay muted></video>
                    </div>
                    {/* audio video parmisson button */}
                    <button>audio</button>
                    <button>video</button>
                </div>
            ) : (
                <div className={styles.meetVideoContainer}>
                    {/* {showModal ? (
                        <div className={styles.chatRoom}>
                            <div className={styles.chatContainer}>
                                <h1>Chat</h1>

                                <div className={styles.chattingDisplay}>
                                    {messages.length !== 0 ? (
                                        messages.map((item, index) => {
                                            console.log(messages);
                                            return (
                                                <div style={{ marginBottom: "20px" }} key={index}>
                                                    <p style={{ fontWeight: "bold" }}>{item.sender}</p>
                                                    <p>{item.data}</p>
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <p>No Messages Yet</p>
                                    )}
                                </div>

                                <div className={styles.chattingArea}>
                                    <TextField
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        id="outlined-basic"
                                        label="Enter Your chat"
                                        variant="outlined"
                                    />
                                    <Button variant="contained" onClick={sendMessage}>
                                        Send
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <></>
                    )} */}

                    <div className={styles.buttonContainers}>
                        <IconButton onClick={handleVideo} style={{ color: "white" }}>
                            {video === true ? <VideocamIcon /> : <VideocamOffIcon />}
                        </IconButton>
                        <IconButton onClick={handleEndCall} style={{ color: "red" }}>
                            <CallEndIcon />
                        </IconButton>
                        <IconButton onClick={handleAudio} style={{ color: "white" }}>
                            {audio === true ? <MicIcon /> : <MicOffIcon />}
                        </IconButton>



                        {/* <Badge badgeContent={newMessages} max={999} color="secondary">
                            <IconButton
                                onClick={() => setModal(!showModal)}
                                style={{ color: "white" }}
                            >
                                <ChatIcon />{" "}
                            </IconButton>
                        </Badge> */}
                    </div>

                    <video
                        className={styles.meetUserVideo}
                        ref={localVideoref}
                        autoPlay
                        muted
                    ></video>

                    <div className={styles.conferenceView}>
                        {videos.map((video) => (
                            <div className={styles.videoDiv} key={video.socketId}>
                                {currentUserHost && <button className={styles.video3dot} onClick={() => handelOpenManu(video)}>
                                    <MoreVertIcon className={styles.video3dot} sx={{ fontSize: '40' }} />
                                </button>}

                                {isOpenManu === video.socketId && <div className={styles.videoManuDiv}>
                                    <p>Mute</p>
                                    <p onClick={() => handleKickUser(video)}>Remove</p>
                                </div>}
                                {video.stream ? <video
                                    data-socket={video.socketId}
                                    ref={(ref) => {
                                        if (ref && video.stream) {
                                            ref.srcObject = video.stream;
                                        }
                                    }}
                                    autoPlay
                                > </video>
                                    : <div>
                                        <Avatar sx={{ bgcolor: 'deepOrange[500]' }}>{video.userName?.charAt(0)}</Avatar>
                                    </div>}
                                <p className={styles.videoUserName} >{video.userName}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
