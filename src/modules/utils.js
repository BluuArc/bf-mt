import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
dayjs.extend(relativeTime);

export function delay (time = 0) {
  return new Promise(fulfill => {
    setTimeout(fulfill, time);
  });
}

export async function safelyExecute (fn, onError) {
  try {
    return await fn();
  } catch (err) {
    onError(err);
  }
}

export function getFormattedDate (inputDate) {
  const date = dayjs(inputDate);
  return {
    full: date.toDate().toLocaleString(),
    time: date.toDate().toLocaleTimeString(),
    date: date.toDate().toLocaleDateString(),
    diff: date.fromNow(),
  };
}
