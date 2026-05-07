import Room from '../models/room.model.js';
// import { sendInviteEmail } from '../../../utils/email.js';

/*
create a rome by user when he only a login user

this controller take inviteEmails and  from  req.body;

it return to forontend romeId, joinUrl, hostedId

*/
export const createRoom = async (req, res, next) => {
  try {
    const { inviteEmails = [], romeName, description, startTime, endTime, timezone } = req.body;

    const hostId = req?.id;

    if (!hostId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    // Normalize & convert to Date (UTC safe)
    const start = new Date(startTime);
    // const end = new Date(endTime);

    // Business validation (extra safety beyond Zod)
    // if (start >= end) {
    //   return res.status(400).json({ error: 'End time must be after start time' });
    // }

    if (start < new Date()) {
      return res.status(400).json({ error: 'Past time not allowed' });
    }

    //Create room
    const room = await Room.create({
      title: romeName.trim(),
      description: description?.trim(),
      host: hostId,
      startTime: start,
      // endTime: end,
      timezone,
      status: 'scheduled',
      participants: inviteEmails,
    });

    const joinUrl = `${process.env.FRONTEND_BASE_URL || 'http://localhost:3000'}/join/${room._id}`;

    // Send emails (non-blocking, production safe)
    // if (inviteEmails.length) {
    //   Promise.allSettled(
    //     inviteEmails.map((email) => sendInviteEmail(email, { joinUrl, name: romeName })),
    //   );
    // }

    return res.status(201).json({
      success: true,
      data: {
        roomId: room._id,
        joinUrl,
        hostId,
      },
    });
  } catch (error) {
    next(error); // 🔥 centralized error handler
  }
};

export async function getRoom(req, res) {
  const { id } = req.params;
  const room = await Room.findById(id);
  if (!room) {
    return res.status(404).json({ error: 'not found' });
  }
  res.json(room);
}
