import { Schema, model } from 'mongoose';

const userEventMapSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    eventId: {
      type: Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
      index: true,
    },

    startTime: {
      type: Date,
      required: true,
      index: true,
    },

    yearMonth: {
      type: String, // "2026-05"
      required: true,
      index: true,
    },

    role: {
      type: String,
      enum: ['host', 'participant'],
    },

    status: {
      type: String,
      enum: ['invited', 'accepted', 'declined'],
      index: true,
    },
  },
  { timestamps: true },
);

//super critical index
userEventMapSchema.index({ user: 1, yearMonth: 1 });

// prevent duplicates
userEventMapSchema.index({ user: 1, eventId: 1 }, { unique: true });

export const UserEventMap = model('UserEventMap', userEventMapSchema);
