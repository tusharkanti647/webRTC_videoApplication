import { Schema, model } from "mongoose";

const ParticipantSchema = new Schema({
    socketId: { type: String },
    userId: { type: String },
      displayName: { type: String },
    audioEnabled: { type: Boolean, default: true },
    videoEnabled: { type: Boolean, default: true },
});

const RoomSchema = new Schema({
    // romeId: { type: String, required: true },
    hostId: { type: String, required: true },
    participants: { type: [ParticipantSchema], default: [] },
    createdAt: { type: Date, default: Date.now },
});

export default model("Room", RoomSchema);
