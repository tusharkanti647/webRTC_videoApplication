import { Schema, model } from 'mongoose';

const participantSchema = new Schema(
  {
    eventId: {
      type: Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
      index: true,
    },

    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },

    email: {
      type: String,
      required: true,
      index: true,
    },

    role: {
      type: String,
      enum: ['host', 'participant'],
      default: 'participant',
    },

    status: {
      type: String,
      enum: ['invited', 'accepted', 'declined', 'joined'],
      default: 'invited',
      index: true,
    },

    // 🔴 real-time fields (can also be in Redis)
    socketId: String,

    audioEnabled: {
      type: Boolean,
      default: true,
    },

    videoEnabled: {
      type: Boolean,
      default: true,
    },

    // 📧 tracking
    emailSent: {
      type: Boolean,
      default: false,
    },

    reminderSent: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

// important indexes
participantSchema.index({ eventId: 1, user: 1 });
participantSchema.index({ email: 1, eventId: 1 });

export const Participant = model('Participant', participantSchema);
