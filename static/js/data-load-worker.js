// reference: https://github.com/nolanlawson/promise-worker
importScripts('https://unpkg.com/promise-worker/dist/promise-worker.register.js');

registerPromiseWorker(message => {
  console.debug("[PW] Received message:", message);
  return 'pong';
});
