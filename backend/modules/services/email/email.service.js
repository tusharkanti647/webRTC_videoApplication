import { renderTemplate } from './templateRenderer.js';

export const buildInviteEmail = async ({
  roomName,
  roomId,
  hostName,
  startTime,
  joinUrl,
  timezone,
  description = '',
}) => {
  return renderTemplate('inviteTemplate', {
    ROOM_NAME: roomName,
    ROOM_ID: roomId,
    HOST_NAME: hostName,
    MEETING_DATE: new Date(startTime).toLocaleDateString(),
    MEETING_TIME: new Date(startTime).toLocaleTimeString(),
    JOIN_URL: joinUrl,
    TIMEZONE: timezone,
    DESCRIPTION: description,
  });
};

export const buildReminderEmail = async ({
  roomName,
  hostName,
  roomId,
  startTime,
  joinUrl,
  timezone,
  description = '',
}) => {
  return renderTemplate('reminderTemplate', {
    ROOM_NAME: roomName,
    ROOM_ID: roomId,
    HOST_NAME: hostName,
    MEETING_DATE: new Date(startTime).toLocaleDateString(),
    MEETING_TIME: new Date(startTime).toLocaleTimeString(),
    JOIN_URL: joinUrl,
    TIMEZONE: timezone,
    DESCRIPTION: description,
  });
};
