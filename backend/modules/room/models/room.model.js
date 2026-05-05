import { Schema, model } from 'mongoose';

// const ParticipantSchema = new Schema({
//   socketId: { type: String },
//   userId: { type: String },
//   userName: { type: String },
//   isHostMuted: { type: Boolean, default: false },
//   audioEnabled: { type: Boolean, default: true },
//   videoEnabled: { type: Boolean, default: true },
//   hostId: { type: String, required: true },
//   isHost: { type: String, required: false },
// });

// const RoomSchema = new Schema({
//   // romeId: { type: String, required: true },
//   romeName: { type: String, required: true },
//   hostId: { type: String, required: true },
//   participants: { type: [ParticipantSchema], default: [] },
//   createdAt: { type: Date, default: Date.now },
// });

const RoomSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },

    description: String,

    host: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    startTime: {
      type: Date, // ALWAYS UTC
      required: true,
      index: true,
    },

    endTime: {
      type: Date,
    },

    timezone: {
      type: String, // host timezone
      required: true,
    },

    roomId: {
      type: String,
      unique: true,
      index: true,
    },

    status: {
      type: String,
      enum: ['scheduled', 'ongoing', 'ended', 'cancelled'],
      default: 'scheduled',
      index: true,
    },
    participants: {
      type: [Schema.Types.ObjectId],
      default: [],
    },
  },

  { timestamps: true },
);

// useful for time-based queries
RoomSchema.index({ startTime: 1, host: 1 });

const Room = model('Room', RoomSchema);

export default Room;
