import Exchange from 'worker-exchange/lib/exchange-worker';

const exchange = new Exchange();

function init () {
  self.addEventListener('message', function Once() {
    // I am a dedicated worker
    exchange.addPort(self);
    self.removeEventListener('message', Once);
  });
  self.exchange = exchange;
  // eslint-disable-next-line no-console
  console.warn('hello from worker');
}

exchange.onRequest('ping', function (data, message) {
  message.response = 'Pong ' + data.from;
});
init();
