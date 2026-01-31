
// import Invite from "../models/invite";
import Room from "../models/room.model.js";
import { nanoid } from "nanoid";
import { sendInviteEmail } from "../utils/email.js";
import { getIO, disconnectSocket, emitToSocket } from "../socket/socketManager.js";



// export async function createInvite(req, res) {
//   const { id } = req.params;
//   const { emails } = req.body;
//   const room = await Room.findById(id);
//   if (!room) return res.status(404).json({ error: "room not found" });
//   // check host
//   if (!req.user || String(req.user.id) !== String(room.hostId))
//     return res.status(403).json({ error: "not host" });
//   const tokens = [];
//   if (Array.isArray(emails)) {
//     for (const email of emails) {
//       const token = nanoid(10);
//       const invite = await Invite.create({
//         token,
//         roomId: room._id,
//         email,
//         expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24),
//       });
//       const joinUrl = `${process.env.FRONTEND_BASE_URL || "http://localhost:3000"}/room/${room._id}?invite=${token}`;
//       sendInviteEmail(email, { joinUrl, name: room.name });
//       tokens.push({ email, token, joinUrl });
//     }
//   }
//   res.json({ tokens });
// }

export async function hostMute(req, res) {
    const { id } = req.params; // room id
    const { socketId } = req.body;
    const room = await Room.findById(id);
    if (!room) return res.status(404).json({ error: "room not found" });
    if (!req.user || String(req.user.id) !== String(room.hostId))
        return res.status(403).json({ error: "not host" });
    // emit force-mute to socket
    try {
        emitToSocket(socketId, "force-mute");
        res.json({ ok: true });
    } catch (err) {
        res.status(500).json({ error: "cannot mute" });
    }
}

export async function hostKick(req, res) {
    const { id } = req.params; // room id
    const { socketId } = req.body;
    const room = await Room.findById(id);
    if (!room) return res.status(404).json({ error: "room not found" });
    if (!req.user || String(req.user.id) !== String(room.hostId))
        return res.status(403).json({ error: "not host" });
    try {
        disconnectSocket(socketId);
        res.json({ ok: true });
    } catch (err) {
        res.status(500).json({ error: "cannot kick" });
    }
}
