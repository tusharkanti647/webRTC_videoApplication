import React, { useState } from "react";
import "./Lobby.css";

import { useEffect } from "react";
import { useSocket } from "../socket/SocketProvider";
import { useNavigate } from "react-router";

const Lobby = () => {
    const [email, setEmail] = useState("");
    const [roomId, setRoomId] = useState("");
    const [name, setName] = useState("");

    const socket = useSocket()
    const navigate = useNavigate()

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!email || !roomId || !name) {
            alert("Please enter both Email and Room ID");
            return;
        }

        socket.emit("join-room", { roomId, email, name });

        console.log("Email:", email);
        console.log("Room ID:", roomId);
       
        navigate(`/rome/${roomId}`)

        // later you can emit socket event or navigate
    };

    //soket eventliner
    useEffect(() => {
        const handleJoinRoom = ({ email, roomId, name }) => {
            console.log(email, roomId, name)
            sessionStorage.setItem('email', email)
            sessionStorage.setItem('roomId', roomId)
            sessionStorage.setItem('name', name)

        }


        socket.on("user-joined", handleJoinRoom);
        return () => {
            socket.off("user-joined", handleJoinRoom);
        };
    }, [socket,]);

    return (
        <div className="lobby-container">
            <form className="lobby-card" onSubmit={handleSubmit}>
                <h2 className="lobby-title">Join Lobby</h2>

                <div className="input-group">
                    <label>Name</label>
                    <input
                        type="name"
                        placeholder="Enter your name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                </div>

                <div className="input-group">
                    <label>Email</label>
                    <input
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>

                <div className="input-group">
                    <label>Room ID</label>
                    <input
                        type="text"
                        placeholder="Enter room id"
                        value={roomId}
                        onChange={(e) => setRoomId(e.target.value)}
                    />
                </div>

                <button type="submit" className="join-btn">
                    Join / Create Room
                </button>
            </form>
        </div>
    );
};

export default Lobby;
