import SWorker from '../../assets/sww.min';

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
      return data;
    }),
  },
];

export default SWorker.create(actions);
