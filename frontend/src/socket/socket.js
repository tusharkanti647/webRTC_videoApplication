// src/utils/socket.ts
import { io } from 'socket.io-client';

let socket = null;

function getOrInitDeviceInfo() {
  let info;
  try {
    info = JSON.parse(sessionStorage.getItem('connectedDeviceInfo') || 'null');
  } catch {
    info = null;
  }
  if (!info || typeof info !== 'object') {
    info = { isConnected: false, core: [], deviceAddress: '' };
    sessionStorage.setItem('connectedDeviceInfo', JSON.stringify(info));
  }
  return info;
}

export const connectSocket = () => {
  if (typeof window !== 'undefined') {
    getOrInitDeviceInfo();
  }
  if (!socket) {
    socket = io.connect(process.env.REACT_APP_API_HOST, { secure: false });
    socket.on('connect', () => {
      const info = { ...getOrInitDeviceInfo(), isConnected: false };
      sessionStorage.setItem('connectedDeviceInfo', JSON.stringify(info));
    });
    socket.on('disconnect', () => {
      const info = { ...getOrInitDeviceInfo(), isConnected: false };
      sessionStorage.setItem('connectedDeviceInfo', JSON.stringify(info));
    });
  }
  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
