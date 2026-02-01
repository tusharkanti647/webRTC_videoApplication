

import roomModel from "../models/room.model.js";
import { disconnectSocket } from "./socketManager.js";



//it validet whatevr the romeId send by frontend it is created or not
//present in data base check if not present then not connect the socket
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





export function initSocket(io) {
    io.on("connection", (socket) => {
        console.log("SOMETHING CONNECTED");

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

        socket.on("join-call", async (data) => {
            console.log('LLLLLL')
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

        socket.on("signal", (toId, message, data) => {
            // console.log(socket.id, 'PPPPPPPP', toId, message)
            io.to(toId).emit("signal", socket.id, message, data);
        });

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

        //user muted by host
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
                            "participants.$.audioEnabled": data.audioEnabled
                        }
                    }
                );

                //send back to the host that current user muted now
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

                //send back to the muted user that he muted by host
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


        //user itself mute
        socket.on('user-mute', async (data) => {
            try {
                let fl = await checkRomeIsCreated(data.romeId,)
                console.log('XXXXXXXX', fl)
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

        socket.on('user-videoOff', async (data) => {
            try {
                let fl = await checkRomeIsCreated(data.romeId,)
                console.log('XXXXXXXX', fl)
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

                await roomModel.updateOne(
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

        socket.on("disconnect", async () => {
            const room = await roomModel.findOneAndUpdate(
                { "participants.socketId": socket.id },
                { $pull: { participants: { socketId: socket.id } } },
                { new: true }
            );

            if (room) {
                // io.to(room._id.toString()).emit("room-updated", room.participants);
                room.participants.map((ele) => {
                    io.to(ele.socketId).emit("user-left", socket.id);
                })
            }

            disconnectSocket(socket.id)
        });
    });


}

//697f077ea40f5d7ead684e1b