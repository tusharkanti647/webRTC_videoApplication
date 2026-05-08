import { buildInviteEmail, buildReminderEmail } from '../../services/email/email.service.js';
import { emailQueue } from '../../services/queues/email.queue.js';
import { User } from '../../user/models/user.model.js';
import Room from '../models/room.model.js';

// import { buildInviteEmail, buildReminderEmail } from '../services/email/email.service.js';
// import { sendInviteEmail } from '../../../utils/email.js';

/*
create a rome by user when he only a login user

this controller take inviteEmails and  from  req.body;

it return to forontend romeId, joinUrl, hostedId

*/

export const createRoom = async (req, res, next) => {
  try {
    const { participants = [], romeName, description, startTime, timezone } = req.body;

    const hostId = req.id;

    if (!hostId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    const start = new Date(startTime);

    if (Number.isNaN(start.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid start time',
      });
    }

    if (start < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Past time not allowed',
      });
    }

    // Optional:
    // sanitize emails
    const normalizedParticipants = [
      ...new Set(participants.map((email) => email.trim().toLowerCase())),
    ];

    const room = await Room.create({
      title: romeName.trim(),
      description: description?.trim(),
      host: hostId,
      startTime: start,
      timezone,
      status: 'scheduled',
      participants: normalizedParticipants,
    });

    const hostUser = await User.findById(hostId).select('name');

    const joinUrl = `${process.env.FRONTEND_BASE_URL}/join/${room._id}`;

    // 5 min before meeting
    const reminderDelay = Math.max(0, start.getTime() - Date.now() - 5 * 60 * 1000);

    if (normalizedParticipants.length) {
      const inviteHtml = await buildInviteEmail({
        roomName: room.title,
        roomId: room._id.toString(),
        hostName: hostUser?.name || 'Host',
        startTime: start,
        joinUrl,
        timezone,
      });

      const reminderHtml = await buildReminderEmail({
        roomName: room.title,
        hostName: hostUser?.name || 'Host',
        roomId: room._id.toString(),
        startTime: start,
        joinUrl,
        timezone,
      });

      await Promise.allSettled(
        normalizedParticipants.map(async (email) => {
          // Instant invite email
          await emailQueue.add(
            'meeting-invite',
            {
              to: email,
              subject: `Meeting Invite - ${room.title}`,
              html: inviteHtml,
            },
            {
              attempts: 3,
              backoff: {
                type: 'exponential',
                delay: 5000,
              },
              removeOnComplete: 100,
              removeOnFail: 50,
            },
          );

          if (reminderDelay > 0) {
            // Scheduled reminder
            await emailQueue.add(
              'meeting-reminder',
              {
                to: email,
                subject: `Reminder: ${room.title} starts soon`,
                html: reminderHtml,
              },
              {
                delay: reminderDelay,
                attempts: 3,
                backoff: {
                  type: 'exponential',
                  delay: 5000,
                },
                removeOnComplete: 100,
                removeOnFail: 50,
              },
            );
          }
        }),
      );
    }

    return res.status(201).json({
      success: true,
      data: {
        roomId: room._id,
        joinUrl,
        hostId,
      },
    });
  } catch (error) {
    next(error);
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
