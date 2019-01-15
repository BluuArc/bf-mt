import Exchange from 'worker-exchange/lib/exchange-main';
import DbWorker from 'worker-loader!./worker.js';

const worker = new Exchange(new DbWorker());
// eslint-disable-next-line no-console
console.log(worker);

export default worker;
