import SWorker from '../../assets/sww.min';

const actions = [
  {
    message: 'getJson',
    func: (url) => fetch(url)
      .then(res => res.ok
        ? res.json()
        : Promise.reject(res.statusText)),
  },
];

export default SWorker.create(actions);
