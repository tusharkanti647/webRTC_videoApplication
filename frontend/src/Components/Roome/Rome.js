import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

import styles from "./Rome.module.css";
import { IconButton, Button, TextField, Avatar } from "@mui/material";

import VideocamIcon from "@mui/icons-material/Videocam";
import VideocamOffIcon from "@mui/icons-material/VideocamOff";
import CallEndIcon from "@mui/icons-material/CallEnd";
import MicIcon from "@mui/icons-material/Mic";
import MicOffIcon from "@mui/icons-material/MicOff";
import MoreVertIcon from "@mui/icons-material/MoreVert";

import { useSocket } from "../../socket/SocketProvider";

/* ------------------------------------------------------------------ */
/* --------------------------- WEBRTC CONFIG -------------------------- */
/* ------------------------------------------------------------------ */

const ICE_CONFIG = {
    iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
};

export default function VideoMeetComponent() {
    const navigate = useNavigate();
    const { romeId } = useParams();
    const socket = useSocket();

    /* ---------------------------- REFS -------------------------------- */

    const localVideoRef = useRef(null);
    const socketIdRef = useRef(null);

    const peersRef = useRef({});        // { socketId: RTCPeerConnection }
    const localStreamRef = useRef(null);
    const videosRef = useRef([])

    /* ---------------------------- STATE ------------------------------- */

    const [username, setUsername] = useState("");
    const [askForUsername, setAskForUsername] = useState(true);

    const [videos, setVideos] = useState([]);
    const [videoEnabled, setVideoEnabled] = useState(true);
    const [audioEnabled, setAudioEnabled] = useState(true);

    const [currentUserHost, setCurrentUserHost] = useState(false);
    const [isOpenMenu, setIsOpenMenu] = useState('')


    /* ------------------------- MEDIA HANDLING -------------------------- */

    /**
     * Get camera + microphone access
     */
    const initLocalMedia = async (video = true, audio = true) => {
        const stream = await navigator.mediaDevices.getUserMedia({ video, audio });
        localStreamRef.current = stream;
        localVideoRef.current.srcObject = stream;
        return stream;
    };

    /* ------------------------------------------------------------------ */
    /* ------------------------ PEER CONNECTION -------------------------- */
    /* ------------------------------------------------------------------ */

    /**
     * Create a new RTCPeerConnection
     */
    const createPeer = ({ remoteSocketId, userName, hostId, audioEnabled, videoEnabled }) => {
        const peer = new RTCPeerConnection(ICE_CONFIG);

        // ICE candidate handling
        peer.onicecandidate = (event) => {
            if (event.candidate) {
                socket.emit("signal", remoteSocketId, {
                    ice: event.candidate,
                }, { userName, hostId, audioEnabled, videoEnabled, });
            }
        };

        // Receive remote tracks
        peer.ontrack = (event) => {
            addOrUpdateRemoteStream({ socketId: remoteSocketId, stream: event.streams[0], userName, hostId, audioEnabled, videoEnabled, });
        };

        // Add local tracks to peer
        localStreamRef.current?.getTracks().forEach((track) => {
            peer.addTrack(track, localStreamRef.current);
        });

        peersRef.current[remoteSocketId] = peer;
        return peer;
    };

    /**
     * Create offer and send via socket
     */
    const createAndSendOffer = async ({ peer, remoteSocketId, userName, hostId, audioEnabled, videoEnabled }) => {
        const offer = await peer.createOffer();
        await peer.setLocalDescription(offer);

        socket.emit("signal", remoteSocketId, {
            sdp: peer.localDescription,
        }, { userName, hostId, audioEnabled, videoEnabled });
    };

    /* ------------------------------------------------------------------ */
    /* -------------------------- SIGNALING ------------------------------ */
    /* ------------------------------------------------------------------ */

    /**
     * Handle offer / answer / ice from socket
     */
    const handleSignal = async (fromSocketId, signal, { userName, hostId, audioEnabled, videoEnabled }) => {
        let peer = peersRef.current[fromSocketId];

        if (!peer) {
            peer = createPeer({ remoteSocketId: fromSocketId, userName, hostId, audioEnabled, videoEnabled });
        }

        if (signal.sdp) {
            await peer.setRemoteDescription(
                new RTCSessionDescription(signal.sdp)
            );

            if (signal.sdp.type === "offer") {
                const answer = await peer.createAnswer();
                await peer.setLocalDescription(answer);

                socket.emit("signal", fromSocketId, {
                    sdp: peer.localDescription,
                }, { userName, hostId, audioEnabled, videoEnabled });
            }
        }

        if (signal.ice) {
            await peer.addIceCandidate(new RTCIceCandidate(signal.ice));
        }
    };

    /* ------------------------------------------------------------------ */
    /* ---------------------- ROOM EVENTS -------------------------------- */
    /* ------------------------------------------------------------------ */

    /**
     * When users join room
     */
    const handleUserJoined = (data) => {
        if (!data.status) return;
        console.log('HHHHHHHHH', data)
        data.connectionsSocketIds.forEach(
            ({ socketId, userName, isHost, hostId, audioEnabled, videoEnabled, }) => {
                console.log(socket.id, 'XXXXXXXXXXX123', socketId, userName, isHost)
                if (socketId === socket.id) {
                    setCurrentUserHost(() => (isHost === true || isHost === "true") ? true : false);
                    return;
                }

                const peer = createPeer({ remoteSocketId: socketId, userName, hostId, audioEnabled, videoEnabled });

                if (data.newJoinSocketId === socket.id) {
                    createAndSendOffer({ peer, remoteSocketId: socketId, userName, hostId, audioEnabled, videoEnabled });
                }

                // let videoExists = videosRef.current.find(
                //     (v) => v.socketId === socketId
                // );


                // if (videoExists) {
                //     // Update the stream of the existing video
                //     setVideos((prev) => {
                //         const updatedVideos = prev.map((v) =>
                //             v.socketId === socketId
                //                 ? { ...v, stream: null }
                //                 : v
                //         );
                //         videosRef.current = updatedVideos;
                //         return updatedVideos;
                //     });
                // } else

                if (socketId === data.newJoinSocketId) {
                    setVideos((prev) => {

                        let updatedVideo = [
                            ...prev,
                            { socketId, userName, hostId, audioEnabled, videoEnabled, stream: null },
                        ]
                        videosRef.current = updatedVideo
                        return updatedVideo
                    });
                }
            }
        );
    };

    /**
     * User left room
     */
    const handleUserLeft = (socketId) => {
        peersRef.current[socketId]?.close();
        delete peersRef.current[socketId];

        setVideos((prev) => {
            let updatedVideos = prev.filter((v) => v.socketId !== socketId)

            videosRef.current = updatedVideos
            return updatedVideos
        }
        );
    };

    /**
 * Completely remove a remote user:
 * - stop media tracks
 * - close peer connection
 * - remove from UI
 */
    const removeRemoteUser = (socketId) => {
        // Close peer connection
        const peer = peersRef.current[socketId];
        if (peer) {
            peer.ontrack = null;
            peer.onicecandidate = null;
            peer.close();
            delete peersRef.current[socketId];
        }

        // Stop remote media tracks (VERY IMPORTANT)
        setVideos((prev) => {
            const user = prev.find((v) => v.socketId === socketId);
            if (user?.stream) {
                user.stream.getTracks().forEach((t) => t.stop());
            }
            let updatedVideos = prev.filter((v) => v.socketId !== socketId);

            videosRef.current = updatedVideos
            return updatedVideos
        });
    };

    /* ---------------------- after force kick clean force kick User ----------------------------- */
    const handelUserForceKick = ({ reason }) => {
        alert(reason || "You were removed from the room");

        // Stop local media
        localStreamRef.current?.getTracks().forEach((t) => t.stop());
        localStreamRef.current = null;

        // Close all peer connections
        Object.values(peersRef.current).forEach((peer) => peer.close());
        peersRef.current = {};

        // Clear UI
        setVideos([]);
        videosRef.current = []

        // Disconnect socket
        socket.disconnect();

        navigate("/");
    };


    /* ---------------------- after force kick any user this event cam all other user to remove the video kick user ----------------------------- */
    const handelKickUserByHost = (data) => {
        setVideos((v) => {

            v.filter(video => video.socketId !== data.socketId)
            // videosRef.current = updatedVideos
            // return updatedVideos
        })
    }


    /* ------------------------------------------------------------------ */
    /* ---------------------- STREAM HELPERS ----------------------------- */
    /* ------------------------------------------------------------------ */

    const addOrUpdateRemoteStream = ({ socketId, stream, userName, hostId, audioEnabled, videoEnabled, }) => {
        setVideos((prev) => {
            const exists = prev.find((v) => v.socketId === socketId);
            if (exists) {
                let updatedVideos1 = prev.map((v) =>
                    v.socketId === socketId ? { ...v, stream } : v
                );
                videosRef.current = updatedVideos1
                return updatedVideos1
            }
            let updatedVideos = [...prev, { socketId, socketId, userName, hostId, audioEnabled, videoEnabled, stream }];

            videosRef.current = updatedVideos
            return updatedVideos
        });
    };

    /* ------------------------------------------------------------------ */
    /* -------------------------- CONTROLS ------------------------------- */
    /* ------------------------------------------------------------------ */

    const toggleVideo = () => {
        socket.emit('user-videoOff', { romeId: romeId, videoEnabled: !videoEnabled })

    };

    const toggleAudio = () => {
        socket.emit('user-mute', { romeId: romeId, audioEnabled: !audioEnabled })
    };

    //open menu bar for each video
    const handelOpenMenu = (videoObj) => {
        if (videoObj.socketId === isOpenMenu) setIsOpenMenu('')
        else setIsOpenMenu(videoObj.socketId)
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


    //muted the user by host
    const handelMuteUser = async (videoObj) => {
        socket.emit('host-user-mute', { romeId: romeId, socketId: videoObj.socketId, audioEnabled: !videoObj.audioEnabled })

    };

    //response cam user is muted  when host mute the user
    const responseHostUsrMute = (data) => {
        console.log('XXXXXXX67 responseHostUsrMute', data)
        if (data.status) {
            setVideos((v) => v.map(item =>
                item.socketId === data.mutedSocketId
                    ? { ...item, audioEnabled: data.audioEnabled }
                    : item
            ))
            setIsOpenMenu(false)
            alert('User audio track change successfully')
        } else {
            alert('User audio track change fail')
        }
    }

    // //response cam muted user that he muted by host
    const responseHostByUserMute = (data) => {
        setAudioEnabled(data.audioEnabled)

        localStreamRef.current
            ?.getAudioTracks()
            .forEach((t) => (t.enabled = data.audioEnabled));
    }

    //response cam for remote user is muted now
    const responseRemoteUserMuted = (data) => {
        console.log('XXXXXXX67 responseRemoteUserMuted', data)
        setVideos((v) => v.map(item =>
            item.socketId === data.mutedSocketId
                ? { ...item, audioEnabled: data.audioEnabled }
                : item
        ))
    }

    //const user itself muted response
    const responseUserMute = (data) => {
        console.log('XXXXXXXXXXXX responseUserMute', data)
        if (data.status) {

            localStreamRef.current
                ?.getAudioTracks()
                .forEach((t) => (t.enabled = data.audioEnabled));
            setAudioEnabled(data.audioEnabled)

            alert('Audio track change successfully')
        } else {
            alert('Audio track change fail')
        }
    }

    //const user itself video off response
    const responseUserVideoOff = (data) => {
        console.log('XXXXXXXXXXXX responseUserVideoOff', data)
        if (data.status) {

            localStreamRef.current
                ?.getVideoTracks()
                .forEach((t) => (t.enabled = data.videoEnabled));

            setVideoEnabled(data.videoEnabled)

            alert('Video track change successfully')
        } else {
            alert('Video track change fail')
        }
    }

    //remote user itself video off response
    const responseRemoteUserVideOff = (data) => {
        console.log('XXXXXXXXXXXX responseRemoteUserVideOff', data)
        setVideos((v) => v.map(item =>
            item.socketId === data.videoOffSocketId
                ? { ...item, videoEnabled: data.videoEnabled }
                : item
        ))
    }

    /* ------------------------------------------------------------------ */
    /* -------------------------- CLEANUP -------------------------------- */
    /* ------------------------------------------------------------------ */

    const cleanup = () => {
        Object.values(peersRef.current).forEach((p) => p.close());
        peersRef.current = {};

        localStreamRef.current?.getTracks().forEach((t) => t.stop());
        localStreamRef.current = null;
    };

    // const handleEndCall = () => {
    //     cleanup();
    //     socket.disconnect();
    //     navigate("/");
    // };

    const handleEndCall = () => {
        // Stop local tracks
        localStreamRef.current?.getTracks().forEach((t) => t.stop());
        localStreamRef.current = null;

        // Close peers
        Object.values(peersRef.current).forEach((peer) => peer.close());
        peersRef.current = {};

        // Clear UI
        setVideos([]);
        videosRef.current = []

        // Inform server (IMPORTANT)
        socket.emit("leave-room", { romeId });

        // socket.disconnect();
        navigate("/");
    };


    /* ------------------------------------------------------------------ */
    /* -------------------------- JOIN ROOM ------------------------------ */
    /* ------------------------------------------------------------------ */

    const connect = async () => {
        if (username.length > 35) {
            alert('Display name cannot exceed 30 characters.')
            return
        }

        setAskForUsername(false);
        await initLocalMedia();
        socket.emit("join-call", {
            romeId,
            userName: username,
            userId: sessionStorage.getItem("userId"),
        });
        socketIdRef.current = socket.id;
    };

    /* ------------------------------------------------------------------ */
    /* -------------------------- SOCKET HOOK ---------------------------- */
    /* ------------------------------------------------------------------ */

    useEffect(() => {
        if (!socket) return;

        socket.on("signal", handleSignal);
        socket.on("user-joined", handleUserJoined);
        socket.on("user-left", removeRemoteUser);
        socket.on("force-kick", handelUserForceKick);
        socket.on("kick-user-byHost", handelKickUserByHost);
        socket.on("host-user-mute", responseHostUsrMute);

        //response cam muted user that he muted by host
        socket.on("host-by-user-mute", responseHostByUserMute);

        //response cam for remote user is muted now
        socket.on("remote-user-mute", responseRemoteUserMuted);

        //response user itself mute
        socket.on("user-mute", responseUserMute);

        //response user itself video off
        socket.on("user-videoOff", responseUserVideoOff);

        //remote user itself video off response
        socket.on("remote-user-videoOff", responseRemoteUserVideOff);

        return () => {
            socket.off("signal", handleSignal);
            socket.off("user-joined", handleUserJoined);
            socket.off("user-left", removeRemoteUser);
            socket.off("force-kick", handelUserForceKick);
            socket.off("kick-user-byHost", handelKickUserByHost);
            socket.off("host-user-mute", responseHostUsrMute);
            socket.off("host-by-user-mute", responseHostByUserMute);
            socket.off("remote-user-mute", responseRemoteUserMuted);
            socket.off("user-mute", responseUserMute);
            socket.off("user-videoOff", responseUserVideoOff);
            socket.on("remote-user-videoOff", responseRemoteUserVideOff);
        };
    }, [socket]);

    /* ------------------------------------------------------------------ */
    /* ------------------------------- UI -------------------------------- */
    /* ------------------------------------------------------------------ */

    return (
        <div>
            {askForUsername ? (
                <div className={styles.userNameEnterDiv} >
                    <h2 style={{ width: '400px', marginBottom: '20px', textAlign: 'center' }}>Enter Room</h2>

                    <TextField
                        label="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        sx={{ width: '400px', marginBottom: '20px' }}
                    />
                    <video ref={localVideoRef} autoPlay muted width="350" style={{ marginBottom: '20px' }} />
                    <Button sx={{ width: '400px', marginBottom: '20px' }} variant="contained" onClick={connect}>
                        Connect
                    </Button>


                </div>
            ) : (
                <div className={styles.meetVideoContainer}>
                    <div className={styles.buttonContainers}>
                        <IconButton onClick={toggleVideo}>
                            {videoEnabled ? <VideocamIcon sx={{ color: 'white' }} /> : <VideocamOffIcon sx={{ color: 'white' }} />}
                        </IconButton>

                        <IconButton onClick={handleEndCall} color="error">
                            <CallEndIcon />
                        </IconButton>

                        <IconButton onClick={toggleAudio}>
                            {audioEnabled ? <MicIcon sx={{ color: 'white' }} /> : <MicOffIcon sx={{ color: 'white' }} />}
                        </IconButton>
                    </div>

                    <video
                        className={styles.meetUserVideo}
                        ref={localVideoRef}
                        autoPlay
                        muted
                    />

                    <div className={styles.conferenceView}>
                        {videos.map((v) => (
                            <div key={v.socketId} className={styles.videoDiv}>
                                {console.log('MMMMMMMM', currentUserHost)}
                                {currentUserHost && <button className={styles.video3dot} onClick={() => handelOpenMenu(v)}>
                                    <MoreVertIcon className={styles.video3dot} sx={{ fontSize: '40', bgcolor: 'gray' }} />
                                </button>}

                                {isOpenMenu === v.socketId && <div className={styles.videoManuDiv}>
                                    <p onClick={() => handelMuteUser(v)}>{v.audioEnabled ? 'Mute' : 'Unmute'}</p>
                                    <p onClick={() => handleKickUser(v)}>Remove</p>
                                </div>}

                                {v.stream ? (
                                    <video
                                        autoPlay
                                        ref={(ref) => ref && (ref.srcObject = v.stream)}
                                    />
                                ) : (
                                    <Avatar>{v.userName?.[0]}</Avatar>
                                )}
                                <p className={styles.videoUserName}>{v.userName}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
