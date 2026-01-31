
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

let connections = {};
// let messages = {};
// let timeOnline = {};

//it validet whatevr the romeId send by frontend it is created or not
//present in data base check if not present then not connect the socket
const checkRomeIsCreated = async (romeId) => {
    try {
        const room = await roomModel.findById(romeId);
        if (!room) return {
            status: false,
            message: 'rome is not created now'
        };

        return {
            status: true,
            message: 'rome is not created'
        };
    } catch (e) {
        throw new Error('e.message')
    }
}

export function initSocket(io) {
    io.on("connection", (socket) => {
        console.log("SOMETHING CONNECTED");

        socket.on("join-call", (data) => {
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
                }
                console.log('UUUUUU', data, socket.id)

                //return the frontend this is not connect rome is not present
                if (!checkRomeIsCreated(data.romeId).status) {
                    io.to(socket.id).emit(
                        "user-joined",
                        {
                            status: false,
                            socketId: socket.id,
                            message: 'This romeId is not created now',
                            romeId: data.romeId
                        }
                    );
                }

                if (connections[data.romeId] === undefined) {
                    connections[data.romeId] = [];
                }
                connections[data.romeId].push(socket.id);

                //   timeOnline[socket.id] = new Date();


                console.log('CCCCCC', connections[data.romeId])
                for (let a = 0; a < connections[data.romeId].length; a++) {
                    io.to(connections[data.romeId][a]).emit(
                        "user-joined", {
                        status: true,
                        newJoinSocketId: socket.id,
                        connectionsSocketIds: connections[data.romeId]
                    }
                    );
                }

                //   if (messages[path] !== undefined) {
                //     for (let a = 0; a < messages[path].length; ++a) {
                //       io.to(socket.id).emit(
                //         "chat-message",
                //         messages[path][a]["data"],
                //         messages[path][a]["sender"],
                //         messages[path][a]["socket-id-sender"]
                //       );
                //     }
                //   }
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
            io.to(toId).emit("signal", socket.id, message);
        });

        // socket.on("chat-message", (data, sender) => {
        //   const [matchingRoom, found] = Object.entries(connections).reduce(
        //     ([room, isFound], [roomKey, roomValue]) => {
        //       if (!isFound && roomValue.includes(socket.id)) {
        //         return [roomKey, true];
        //       }

        //       return [room, isFound];
        //     },
        //     ["", false]
        //   );

        //   if (found === true) {
        //     if (messages[matchingRoom] === undefined) {
        //       messages[matchingRoom] = [];
        //     }

        //     messages[matchingRoom].push({
        //       sender: sender,
        //       data: data,
        //       "socket-id-sender": socket.id,
        //     });
        //     console.log("message", matchingRoom, ":", sender, data);

        //     connections[matchingRoom].forEach((elem) => {
        //       io.to(elem).emit("chat-message", data, sender, socket.id);
        //     });
        //   }
        // });

        socket.on("disconnect", () => {
            //   var diffTime = Math.abs(timeOnline[socket.id] - new Date());

            var key;

            for (const [k, v] of JSON.parse(
                JSON.stringify(Object.entries(connections))
            )) {
                for (let a = 0; a < v.length; ++a) {
                    if (v[a] === socket.id) {
                        key = k;

                        for (let a = 0; a < connections[key].length; ++a) {
                            io.to(connections[key][a]).emit("user-left", socket.id);
                        }

                        var index = connections[key].indexOf(socket.id);

                        connections[key].splice(index, 1);

                        if (connections[key].length === 0) {
                            delete connections[key];
                        }
                    }
                }
            }
        });
    });
}

//697dd63365838c93fccd3e9a