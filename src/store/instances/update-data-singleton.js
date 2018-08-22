import downloadWorker from './download-worker';
import { Logger } from '@/modules/logger';
import { moduleInfo } from '@/store';

const logger = new Logger({ prefix: '[UPDATE-DATA-CACHE]' });

const localCache = {
  updateTime: new Date('Jan 01 1969'),
  updateData: {},
  lifetime: 1000 * 60 * 5, // 5 minutes in milliseconds
};

export default async function getUpdateTimes () {
  const currentDate = new Date();
  const diff = currentDate - localCache.updateTime;
  if (diff > localCache.lifetime) {
    try {
      const url = `${location.origin}${location.pathname}static/bf-data/update-stats.json`;
      const data = await downloadWorker.postMessage('getJson', [url]);
      moduleInfo.forEach(({ name }) => {
        if (data[name]) {
          Object.keys(data[name]).forEach(server => {
            data[name][server] = new Date(data[name][server]);
          });
        }
      });
      logger.debug('new update data', data);
      localCache.updateData = data;
      localCache.updateTime = currentDate;
    } catch (err) {
      logger.error(err);
    }
  } else {
    logger.debug('using cached data. cache lifetime (secs):', Math.floor(diff / 1000));
  }
  return Promise.resolve(localCache.updateData);
}
