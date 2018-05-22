import SWorker from 'simple-web-worker';

const actions = [
  {
    message: 'getJson',
    func: (url) => fetch(url).then(res => {
      if (res.ok) {
        return res.json();
      } else {
        throw Error(res.statusText);
      }
    }).then(data => {
      console.debug(url, 'has', Object.keys(data).length, 'keys');
      return data;
    }),
  },
];

export default SWorker.create(actions);
