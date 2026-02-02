

import roomModel from "../models/room.model.js";
import { disconnectSocket } from "./socketManager.js";



/* ------------------------------------------------------------------
   Helper Function
   ------------------------------------------------------------------
   Validates whether the roomId sent from frontend exists in database.
   If room does not exist → socket should not be allowed to join.
-------------------------------------------------------------------*/
const checkRomeIsCreated = async (romeId,) => {
    try {
        const rome = await roomModel.findById(romeId);

        if (!rome) return {
            status: false,
            message: 'rome is not created now'
        };


        return {
            status: true,
            message: 'rome is created',
            rome,
        };

    } catch (e) {
        throw new Error(e.message)
    }
}


/* ------------------------------------------------------------------
   Socket Initialization
   ------------------------------------------------------------------
   This function initializes all socket.io events.
   It runs once when socket server starts.
-------------------------------------------------------------------*/
export function initSocket(io) {
    io.on("connection", (socket) => {
        console.log("SOMETHING CONNECTED");

        /* --------------------------------------------------------------
           CHECK ROOM EVENT
           --------------------------------------------------------------
           - Verifies whether the given roomId exists
           - Frontend sends { romeId }
           - Returns status true/false
        ---------------------------------------------------------------*/
        socket.on("check-rome", async (data) => {
            try {

                if (!data?.romeId) {
                    io.to(socket.id).emit(
                        "check-rome",
                        {
                            status: false,
                            socketId: socket.id,
                            message: 'Required a romeId 333444',
                            romeId: ''
                        }
                    );

                    return
                }
                let fl = await checkRomeIsCreated(data.romeId)
                //return the frontend this is not connect rome is not present
                if (!fl.status) {
                    io.to(socket.id).emit(
                        "check-rome",
                        {
                            fl,
                            status: false,
                            socketId: socket.id,
                            message: 'This romeId is not created now',
                            romeId: data.romeId
                        }
                    );
                } else {
                    io.to(socket.id).emit(
                        "check-rome",
                        {
                            status: true,
                            socketId: socket.id,
                            message: 'This romeId is present',
                        }
                    )
                }


            } catch (e) {
                console.log('ERROR', e)
                io.to(socket.id).emit(
                    "check-rome",
                    {
                        status: false,
                        socketId: socket.id,
                        message: e.message,

                    }
                );
            }
        });

        /* --------------------------------------------------------------
        JOIN CALL EVENT
        --------------------------------------------------------------
        - User joins the room
        - Adds participant to DB
        - Notifies all existing participants
       - Frontend sends { romeId, userId,userName }
     ---------------------------------------------------------------*/
        socket.on("join-call", async (data) => {
            try {
                if (!data?.romeId) {
                    io.to(socket.id).emit(
                        "user-joined",
                        {
                            status: false,
                            socketId: socket.id,
                            message: 'Required a romeId',
                            romeId: ''
                        }
                    );

                    return
                }


                //return the frontend this is not connect rome is not present
                let fl = await checkRomeIsCreated(data.romeId,)
                console.log('XXXXXXXX', fl)
                if (!fl.status) {
                    io.to(socket.id).emit(
                        "user-joined",
                        {
                            status: false,
                            socketId: socket.id,
                            message: 'This romeId is not created now',
                            romeId: data.romeId
                        }
                    );

                    return
                }


                // Add user to participants list
                let isHost = fl.rome?.hostId === data.userId
                console.log('KKKKKKKKJJJJJ', isHost, data.userId)
                fl.rome.participants.push({
                    socketId: socket.id, userName: data.userName,
                    hostId: fl.rome?.hostId ?? '', audioEnabled: true, videoEnabled: true, isHost
                });
                await fl.rome.save()


                for (let a = 0; a < fl.rome.participants.length; a++) {
                    io.to(fl.rome.participants[a].socketId).emit(
                        "user-joined", {
                        status: true,
                        newJoinSocketId: socket.id,
                        connectionsSocketIds: fl.rome.participants
                    }
                    );
                }


            } catch (e) {
                console.log('ERROR', e)
                io.to(socket.id).emit(
                    "user-joined",
                    {
                        status: false,
                        socketId: socket.id,
                        message: e.message,
                        romeId: data.romeId,
                    }
                );
            }
        });

        /* --------------------------------------------------------------
           WEBRTC SIGNAL EVENT
           --------------------------------------------------------------
           - Used for exchanging WebRTC offer/answer/ICE candidates
           - Sends signaling data to a specific peer
        ---------------------------------------------------------------*/
        socket.on("signal", (toId, message, data) => {
            io.to(toId).emit("signal", socket.id, message, data);
        });


        /* --------------------------------------------------------------
          LEAVE ROOM EVENT
          --------------------------------------------------------------
          - Triggered when user explicitly leaves room
          - Removes user from DB
          - Notifies remaining participants
       ---------------------------------------------------------------*/
        socket.on("leave-room", async ({ roomId, userId }) => {
            const room = await roomModel.findOneAndUpdate(
                { "participants.socketId": socket.id },
                { $pull: { participants: { socketId: socket.id } } },
                { new: true }
            );

            if (room) {
                room.participants.map((ele) => {
                    io.to(ele.socketId).emit("user-left", socket.id);
                })
            }
        });


        /* --------------------------------------------------------------
           HOST MUTES USER
           --------------------------------------------------------------
           - Host can mute any participant
           - Updates DB
           - Notifies host, muted user, and other participants
        ---------------------------------------------------------------*/
        socket.on('host-user-mute', async (data) => {
            try {
                let fl = await checkRomeIsCreated(data.romeId,)
                console.log('XXXXXXXX', fl)
                if (!fl.status) {
                    io.to(socket.id).emit(
                        "host-user-mute",
                        {
                            status: false,
                            socketId: socket.id,
                            message: 'This romeId is not created now',
                            romeId: data.romeId
                        }
                    );

                    return
                }

                await roomModel.updateOne(
                    {
                        _id: fl.rome._id,
                        "participants.socketId": data.socketId
                    },
                    {
                        $set: {
                            "participants.$.audioEnabled": data.audioEnabled,
                            "participants.$.isHostMuted": !data.audioEnabled
                        }
                    }
                );

                // Notify host
                io.to(socket.id).emit(
                    "host-user-mute",
                    {
                        status: true,
                        socketId: socket.id,
                        mutedSocketId: data.socketId,
                        audioEnabled: data.audioEnabled,
                        message: 'audio track change now',
                        romeId: data.romeId
                    }
                );

                // Notify muted user
                io.to(data.socketId).emit(
                    "host-by-user-mute",
                    {
                        status: true,
                        socketId: socket.id,
                        mutedSocketId: data.socketId,
                        audioEnabled: data.audioEnabled,
                        message: 'your audio track change now',
                        romeId: data.romeId
                    }
                );


                // Notify other users
                if (fl.rome) {
                    fl.rome.participants.map((ele) => {
                        if (data.socketId !== ele.socketId && socket.id !== ele.socketId)
                            io.to(ele.socketId).emit("remote-user-mute", {
                                socketId: socket.id,
                                mutedSocketId: data.socketId,
                                audioEnabled: data.audioEnabled,
                                message: 'host change the user audio track',
                            });
                    })
                }

            } catch (e) {
                io.to(socket.id).emit(
                    "host-user-mute",
                    {
                        status: false,
                        socketId: socket.id,
                        message: e.message,
                        romeId: data.romeId
                    }
                );
            }
        })


 /* ------------------------------------------------------------------
   USER MUTE EVENT
   ------------------------------------------------------------------
   - Triggered when a user mutes/unmutes their own microphone
   - User CANNOT unmute if host has muted them
   - Updates DB and notifies all participants
-------------------------------------------------------------------*/
        socket.on('user-mute', async (data) => {
            try {
                let fl = await checkRomeIsCreated(data.romeId,)
                if (!fl.status) {
                    io.to(socket.id).emit(
                        "user-mute",
                        {
                            status: false,
                            socketId: socket.id,
                            message: 'This romeId is not created now',
                            romeId: data.romeId
                        }
                    );

                    return
                }

                const participant = fl.rome.participants.find(p => p.socketId === socket.id);

                //  If host has muted this user and the user tries to unmute,
                //  block the action and notify the user.
                if (participant.isHostMuted && data.audioEnabled === true) {
                    // User is trying to enable audio but host muted them
                    io.to(socket.id).emit("user-mute", {
                        status: false,
                        socketId: socket.id,
                        message: 'muted by host',
                        romeId: data.romeId,
                        audioEnabled: participant.audioEnabled
                    });
                    return
                }

                 // Update user's video state in database
                await roomModel.updateOne(
                    {
                        _id: fl.rome._id,
                        "participants.socketId": socket.id
                    },
                    {
                        $set: {
                            "participants.$.audioEnabled": data.audioEnabled
                        }
                    }
                );

                io.to(socket.id).emit(
                    "user-mute",
                    {
                        status: true,
                        socketId: socket.id,
                        message: 'audio track change now',
                        romeId: data.romeId,
                        audioEnabled: data.audioEnabled
                    }
                );

                if (fl.rome) {
                    fl.rome.participants.map((ele) => {
                        if (socket.id !== ele.socketId)
                            io.to(ele.socketId).emit("remote-user-mute", {
                                status: true,
                                mutedSocketId: socket.id,
                                message: 'audio track change now',
                                romeId: data.romeId,
                                audioEnabled: data.audioEnabled
                            });
                    })
                }

            } catch (e) {
                io.to(socket.id).emit(
                    "user-mute",
                    {
                        status: false,
                        socketId: socket.id,
                        message: e.message,
                        romeId: data.romeId
                    }
                );
            }
        })


/* ------------------------------------------------------------------
   USER VIDEO ON / OFF EVENT
   ------------------------------------------------------------------
   - Triggered when a user turns their camera on or off
   - Updates DB and notifies all participants
-------------------------------------------------------------------*/
        socket.on('user-videoOff', async (data) => {
            try {
                let fl = await checkRomeIsCreated(data.romeId,)

                if (!fl.status) {
                    io.to(socket.id).emit(
                        "user-videoOff",
                        {
                            status: false,
                            socketId: socket.id,
                            message: 'This romeId is not created now',
                            romeId: data.romeId
                        }
                    );

                    return
                }



                let result = await roomModel.updateOne(
                    {
                        _id: fl.rome._id,
                        "participants.socketId": socket.id
                    },
                    {
                        $set: {
                            "participants.$.videoEnabled": data.videoEnabled
                        }
                    }
                );
                console.log("UPDATE RESULT:", result);

                io.to(socket.id).emit(
                    "user-videoOff",
                    {
                        status: true,
                        socketId: socket.id,
                        message: 'video track change now',
                        romeId: data.romeId,
                        videoEnabled: data.videoEnabled
                    }
                );

                if (fl.rome) {
                    fl.rome.participants.map((ele) => {
                        if (socket.id !== ele.socketId)
                            io.to(ele.socketId).emit("remote-user-videoOff", {
                                status: true,
                                videoOffSocketId: socket.id,
                                message: 'video track change now',
                                romeId: data.romeId,
                                videoEnabled: data.videoEnabled
                            });
                    })
                }

            } catch (e) {
                io.to(socket.id).emit(
                    "user-videoOff",
                    {
                        status: false,
                        socketId: socket.id,
                        message: e.message,
                        romeId: data.romeId
                    }
                );
            }
        })

        /* --------------------------------------------------------------
          SOCKET DISCONNECT EVENT
          --------------------------------------------------------------
          - Triggered when socket disconnects (refresh / close tab)
          - Cleans DB
          - Notifies remaining users
       ---------------------------------------------------------------*/
        socket.on("disconnect", async () => {
            const room = await roomModel.findOneAndUpdate(
                { "participants.socketId": socket.id },
                { $pull: { participants: { socketId: socket.id } } },
                { new: true }
            );

            if (room) {
                room.participants.map((ele) => {
                    io.to(ele.socketId).emit("user-left", socket.id);
                })
            }

            disconnectSocket(socket.id)
        });
    });


}

//697f077ea40f5d7ead684e1b