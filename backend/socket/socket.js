
/*
export function initSocket1(io) {
    io.on("connection", (socket) => {
        console.log("socket connected", socket.id);

        socket.on("join-room", ({ roomId, email, name }) => {
            console.log('JJJJJJ', roomId, email, name)
            socket.join(roomId);
            // socket.to(roomId).emit("user-joined", { socketId: socket.id, email, name });
            io.to(roomId).emit("new-user-joined", { socketId: socket.id, roomId, email, name });
            io.to(socket.id).emit("user-joined", { socketId: socket.id, roomId, email, name });
        });

        socket.on("signal", ({ to, data }) => {
            io.to(to).emit("signal", { from: socket.id, data });
        });

        socket.on("media-state", ({ roomId, audioEnabled, videoEnabled }) => {
            socket
                .to(roomId)
                .emit("peer-media-state", {
                    userId: socket.id,
                    audioEnabled,
                    videoEnabled,
                });
        });

        socket.on("leave-room", ({ roomId, userId }) => {
            socket.leave(roomId);
            socket.to(roomId).emit("user-left", { userId, socketId: socket.id });
        });

        socket.on("disconnect", () => {
            console.log("socket disconnected", socket.id);
            io.emit("peer-disconnected", { socketId: socket.id });
        });
    });
}

*/

import roomModel from "../models/room.model.js";
import { disconnectSocket } from "./socketManager.js";

let connections = {};
// let messages = {};
// let timeOnline = {};

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
                let fl = await checkRomeIsCreated(data.romeId, true)
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

                // if (connections[data.romeId] === undefined) {
                //     connections[data.romeId] = [];
                // }

                // connections[data.romeId]
                fl.rome.participants.push({
                    socketId: socket.id, userName: data.userName,
                    hostId: fl.rome?.hostId ?? '', audioEnabled: true, videoEnabled: true, isHost: fl.rome?.hostId === data.userId
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

        socket.on("signal", (toId, message) => {
            // console.log(socket.id, 'PPPPPPPP', toId, message)
            io.to(toId).emit("signal", socket.id, message);
        });

        socket.on('disconnect', (reason) => {
            console.log('User disconnected:', socket.id);
            console.log('Reason:', reason);
        });

        socket.on("disconnect", async () => {
            //   var diffTime = Math.abs(timeOnline[socket.id] - new Date());

            // var key;

            // for (const [k, v] of JSON.parse(
            //     JSON.stringify(Object.entries(connections))
            // )) {
            //     for (let a = 0; a < v.length; ++a) {
            //         if (v[a].socketId === socket.id) {
            //             key = k;

            //             var index // = connections[key].indexOf(socket.id);
            //             for (let a = 0; a < connections[key].length; ++a) {
            //                 io.to(connections[key][a].socketId).emit("user-left", socket.id);
            //                 index = a
            //             }



            //             connections[key].splice(index, 1);

            //             if (connections[key].length === 0) {
            //                 delete connections[key];
            //             }
            //         }
            //     }
            // }

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

//697dd63365838c93fccd3e9a