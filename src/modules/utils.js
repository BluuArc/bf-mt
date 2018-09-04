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

export function arraysAreDifferent (arr1 = [], arr2 = []) {
  return arr1.length !== arr2.length ||
    arr1.some(val => !arr2.includes(val)) ||
    arr2.some(val => !arr1.includes(val));
}
