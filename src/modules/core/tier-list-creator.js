import colors from 'vuetify/es5/util/colors';
import { convertCompareCodeToInput } from './compare';

export function convertCodeToInput (input = '') {
  return convertCompareCodeToInput(input);
}

export function convertInputToCode ({ type = '', id = '' }) {
  return `${type}-${id}`;
}

export function fetchBase64Png (url = '') {
  // const BASE_URL = 'https://macabre-broomstick-39921.herokuapp.com/getImage';
  const BASE_URL = 'http://localhost:5000/getImage';
  return fetch(`${BASE_URL}/${encodeURIComponent(url)}?format=text/plain`)
    .then(res => res.ok
        ? res.text()
        : Promise.reject(res.statusText)
    ).then(b64 => `data:image/png;base64,${b64}`);
}

export function getDefaultCategories () {
  return [{
      name: 'S',
      backgroundColor: colors.red.accent1,
      textColor: colors.shades.black,
    },
    {
      name: 'A',
      backgroundColor: colors.orange.accent1,
      textColor: colors.shades.black,
    },
    {
      name: 'B',
      backgroundColor: colors.yellow.lighten1,
      textColor: colors.shades.black,
    },
    {
      name: 'C',
      backgroundColor: colors.green.lighten2,
      textColor: colors.shades.black,
    },
    {
      name: 'D',
      backgroundColor: colors.blue.lighten2,
      textColor: colors.shades.black,
    },
  ];
}
