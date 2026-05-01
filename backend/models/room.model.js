import { Schema, model } from 'mongoose';

const ParticipantSchema = new Schema({
  socketId: { type: String },
  userId: { type: String },
  userName: { type: String },
  isHostMuted: { type: Boolean, default: false },
  audioEnabled: { type: Boolean, default: true },
  videoEnabled: { type: Boolean, default: true },
  hostId: { type: String, required: true },
  isHost: { type: String, required: false },
});

const RoomSchema = new Schema({
  // romeId: { type: String, required: true },
  romeName: { type: String, required: true },
  hostId: { type: String, required: true },
  participants: { type: [ParticipantSchema], default: [] },
  createdAt: { type: Date, default: Date.now },
});

export default model('Room', RoomSchema);
