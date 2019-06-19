import PromiseWorkerExchangeClient from '@/modules/PromiseWorkerExchange/client';
import SimWorker from 'worker-loader!../worker/index.js';
import ClientApi from './ClientApi';

export default function makeWorker () {
  const worker = new PromiseWorkerExchangeClient(new SimWorker());
  return new ClientApi(worker);
}
