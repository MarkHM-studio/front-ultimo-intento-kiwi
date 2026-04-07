const STORAGE_KEY = 'lapituca:data-sync';
const CHANNEL_NAME = 'lapituca-data-sync';

let channel: BroadcastChannel | null = null;

const getChannel = () => {
  if (typeof window === 'undefined' || typeof BroadcastChannel === 'undefined') {
    return null;
  }

  if (!channel) {
    channel = new BroadcastChannel(CHANNEL_NAME);
  }

  return channel;
};

export const notifyDataChanged = () => {
  if (typeof window === 'undefined') return;

  const payload = `${Date.now()}`;

  localStorage.setItem(STORAGE_KEY, payload);
  const bc = getChannel();
  bc?.postMessage(payload);
};

export const subscribeToDataChanges = (callback: () => void) => {
  if (typeof window === 'undefined') {
    return () => {};
  }

  const storageHandler = (event: StorageEvent) => {
    if (event.key !== STORAGE_KEY || !event.newValue) return;
    callback();
  };

  window.addEventListener('storage', storageHandler);

  const bc = getChannel();
  const bcHandler = () => callback();

  if (bc) {
    bc.addEventListener('message', bcHandler);
  }

  return () => {
    window.removeEventListener('storage', storageHandler);
    if (bc) {
      bc.removeEventListener('message', bcHandler);
    }
  };
};
