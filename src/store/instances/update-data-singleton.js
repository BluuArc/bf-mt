import downloadWorker from './download-worker';
import { moduleInfo } from '@/store';
import CacheSingleton from '@/modules/CacheSingleton';

const updateDataSingleton = new CacheSingleton({
  loggerOptions: {
    prefix: '[UPDATE-DATA-CACHE]'
  },
  async getter (logger) {
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
    return data;
  },
  defaultValue: {},
});

export default function getUpdateTimes (forceRefresh) {
  return updateDataSingleton.getValue(forceRefresh);
}
