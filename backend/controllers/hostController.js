
// import Invite from "../models/invite";
import Room from "../models/room.model.js";
import { nanoid } from "nanoid";
import { sendInviteEmail } from "../utils/email.js";
import { getIO, disconnectSocket, emitToSocket } from "../socket/socketManager.js";
import roomModel from "../models/room.model.js";


export async function hostMute(req, res) {
    const { id } = req.params; // room id
    const { socketId } = req.body;
    const room = await Room.findById(id);
    if (!room) return res.status(404).json({ error: "room not found" });

    const hostId = req?.id; //this host user id
    if (!hostId) return res.status(401).json({ error: "not authenticated" });

    // only the room host can mute participants
    if (String(room.hostId) !== String(hostId)) {
        return res.status(403).json({ error: "only host can mute participants" });
    }

    const participant = room.participants.find((p) => p.socketId === socketId);
    if (!participant) return res.status(404).json({ error: "participant not found in room" });

    // emit force-mute to socket
    try {
        // update participant flag in DB
        await roomModel.findOneAndUpdate(
            { _id: id, "participants.socketId": socketId },
            { $set: { "participants.$.audioEnabled": false } },
            { new: true }
        );

        // tell the target client to mute itself
        emitToSocket(socketId, "force-mute", { reason: "muted by host" });

        // notify all participants about the change so UI can update
        const updatedRoom = await roomModel.findById(id);
        if (updatedRoom) {
            updatedRoom.participants.forEach((p) => {
                emitToSocket(p.socketId, "participant-updated", {
                    socketId,
                    audioEnabled: false,
                });
            });
        }

        res.json({ ok: true });
    } catch (err) {
        res.status(500).json({ error: "cannot mute" });
    }
}

export async function hostKick(req, res) {
    const { id } = req.params; // room id
    const { socketId } = req.body;



    const hostId = req?.id; //this host user id
    if (!hostId) return res.status(401).json({ error: "not authenticated" });

    const room = await roomModel.findById(id);
    if (!room) return res.status(404).json({ error: "room not found" });

    // only the room host can kick participants
    if (String(room.hostId) !== String(hostId)) {
        return res.status(403).json({ error: "only host can remove participants" });
    }

    const participant = room.participants.find((p) => p.socketId === socketId);
    if (!participant) return res.status(404).json({ error: "participant not found in room" });

    try {
        await roomModel.findOneAndUpdate(
            { _id: id },
            { $pull: { participants: { socketId } } },
            { new: true }
        );

        // notify client it's being removed, then disconnect
        emitToSocket(socketId, "force-kick", { reason: "removed by host" });
        disconnectSocket(socketId);
        res.status(200).json({
            success: true,
            message: "PARTICIPANT REMOVED SUCCESSFULLY"
        });

        // notify all participants about the change so UI can update
        const updatedRoom = await roomModel.findById(id);
        if (updatedRoom) {
            updatedRoom.participants.forEach((p) => {
                emitToSocket(p.socketId, "kick-user-byHost", {
                    socketId,
                });
            });
        }
    } catch (err) {
        res.status(500).json({ error: "cannot kick" });
    }
}
