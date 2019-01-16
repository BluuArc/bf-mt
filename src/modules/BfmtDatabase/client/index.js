import Exchange from 'worker-exchange/lib/exchange-main';
import DbWorker from 'worker-loader!../worker/index.js';
import ClientApi from './ClientApi';

const worker = new Exchange(new DbWorker());
export default new ClientApi(worker);
