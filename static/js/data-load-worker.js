// reference: https://github.com/nolanlawson/promise-worker
importScripts('https://unpkg.com/promise-worker/dist/promise-worker.register.js');

const ajaxWrapper = {
  getData(url) {
    return new Promise((fulfill, reject) => {
      console.debug(`Starting GET of ${url}`);
      const request = new XMLHttpRequest();
      request.open("GET", url, true);
      request.onload = function() {
        if (request.readyState === 4) {
          if (request.status === 200) {
            console.debug(`Finished GET of ${url}`);
            fulfill(request.responseText);
          } else {
            reject(request.statusText);
          }
        } else {
          console.warn("readyState:", request.readyState);
        }
      };

      request.onerror = function() {
        reject(request.statusText);
      };

      request.onabort = function() {
        reject(`Request to ${url} was canceled`);
      };

      request.onprogress = function(e) {
        if (e.lengthComputable) {
          console.debug(`[PROGRESS] ${url}: ${(e.loaded / e.total) * 100}%`);
        }
      };

      request.send(null);
    });
  },
  getJSON(url) {
    return ajaxWrapper.getData(url)
      .then(data => {
        try {
          return JSON.parse(data);
        } catch (err) {
          console.error(err);
          throw 'Error parsing JSON data';
        }
      });
  }
}

registerPromiseWorker(message => {
  console.debug("[PW] Received message:", message);
  const defaultError = { error: 'unknown command received' };
  return Promise.resolve()
    .then(() => {
      if (typeof message === 'string') {
        if (message === 'register') {
          return 'register acknowledged';
        } else {
          return defaultError;
        }
      } else if (typeof message === 'object') {
        if (message.command === 'getfile') {
          return ajaxWrapper.getData(message.url)
            .catch(err => { return { error: err }; });
        } else if (message.command === 'getjson') {
          return ajaxWrapper.getJSON(message.url)
            .catch(err => { return { error: err }; });
        } else {
          return defaultError;
        }
      }
      return defaultError;
    });
});
