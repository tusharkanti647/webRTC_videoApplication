import Room from '../models/room.model.js';
import { sendInviteEmail } from '../../../utils/email.js';

/*
create a rome by user when he only a login user

this controller take inviteEmails and  from  req.body;

it return to forontend romeId, joinUrl, hostedId

*/
export async function createRoom(req, res) {
  const { inviteEmails, romeName } = req.body;
  try {
    const hostId = req?.id; //this host user id
    if (!hostId) {
      return res.status(401).json({ error: 'not authenticated' });
    }

    if (!romeName || !romeName.trim()) {
      return res.status(400).json({
        error: 'Room name is required',
      });
    }

    const room = await Room.create({ hostId, romeName });
    const joinUrl = `${process.env.FRONTEND_BASE_URL || 'http://localhost:3000'}/join/${room._id}`;

    // optionally send emails
    if (Array.isArray(inviteEmails)) {
      inviteEmails.forEach((email) => sendInviteEmail(email, { joinUrl, name: romeName }));
    }
    res.json({ romeId: room._id, joinUrl, hostId });
  } catch (err) {
    res.status(500).json({ error: 'cannot create room' });
  }
}

export async function getRoom(req, res) {
  const { id } = req.params;
  const room = await Room.findById(id);
  if (!room) {
    return res.status(404).json({ error: 'not found' });
  }
  res.json(room);
}
