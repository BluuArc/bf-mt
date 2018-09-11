import logger from '@/modules/Logger';
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

export function getGenderInfo(gender) {
  const icons = {
    male: 'fa-mars',
    female: 'fa-venus',
    other: 'fa-genderless',
  };
  const colors = {
    male: 'light-blue',
    female: 'pink lighten-1',
    other: 'grey',
  };
  return {
    icon: icons[gender],
    color: colors[gender],
  };
}

// add an extra "useless" param to be added to a URL that forces a new GET from the server
export function getCacheBustingUrlParam () {
  return `cacheBuster=${new Date().valueOf()}`;
}

export function safeGet (obj = {}, path = [], defaultVal = undefined) {
  let result = obj;
  const accessorPath = path.slice();
  try {
    while (accessorPath.length > 0) {
      const currentProp = accessorPath.shift();
      result = result[currentProp];
    }
    return result;
  } catch (err) {
    logger.error('error accessing prop', { obj, path, defaultVal }, err);
    return defaultVal;
  }
}
