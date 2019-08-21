import colors from 'vuetify/es5/util/colors';
import { convertCompareCodeToInput } from './compare';

const DEFAULT_FONT_SIZE = 16;

export function convertCodeToCategory (input = '', isUriComponent) {
  const [name = 'Category', textColor, backgroundColor, fontSize = DEFAULT_FONT_SIZE] = input.split('-');

  return {
    name: isUriComponent ? decodeURIComponent(name) : name,
    // text and background color are hex values without hashes
    textColor: textColor ? `#${textColor}` : colors.shades.black,
    backgroundColor: backgroundColor ? `#${backgroundColor}` : colors.shades.white,
    fontSize: (!isNaN(fontSize) && +fontSize > 0) ? fontSize : DEFAULT_FONT_SIZE,
  };
}

function replaceCharacters (str = '', replacementMapping = []) {
  let currentStr = str.slice();
  replacementMapping.forEach(([oldChar, newChar]) => {
    currentStr = currentStr.replace(oldChar, newChar);
  });
  return currentStr;
}

export function convertCategoryToCode ({ name = '', textColor, backgroundColor, fontSize = DEFAULT_FONT_SIZE }) {
  let textColorCode, backgroundColorCode;
  if (textColor) {
    textColorCode = textColor[0] === '#' ? textColor.slice(1): textColor;
  } else {
    textColorCode = '';
  }

  if (backgroundColor) {
    backgroundColorCode = backgroundColor[0] === '#' ? backgroundColor.slice(1) : backgroundColor;
  } else {
    backgroundColorCode = '';
  }

  const cleanedName = replaceCharacters(name, [[/-/g, ''], [/\./g, '']]);
  return `${cleanedName}-${textColorCode}-${backgroundColorCode}-${fontSize}`;
}

export function convertCodeToEntry (input = '') {
  const convertedInput = convertCompareCodeToInput(input);
  let result;
  if (convertedInput) {
    result = {
      type: convertedInput.type,
      id: convertedInput.id,
      altArtId: convertedInput.options || '',
    };
  }
  return result;
}

export function convertEntryToCode ({ type, id, altArtId }) {
  const baseCode = `${type}-${id}`;
  return altArtId
    ? `${baseCode}_${altArtId}`
    : baseCode;
}

export function generateTierListCode (categories = [], entries = [], config = {}) {
  const categoriesCode = categories
    .map(convertCategoryToCode)
    .join(',');
  const entriesCode = categories
    .map((_, i) => (entries[i] || []).map(convertEntryToCode).join(','))
    .join('!');
  const configCode = Object.keys(config)
    .sort()
    .filter(key => key !== '' && (!!key || key === 0)) // get truthy keys (or 0 for arrays)
    .map(key => {
      const value = typeof config[key] === 'object'
        ? JSON.stringify(config[key])
        : config[key];
      return `${key}!${value}`;
    })
    .join('~');
  return `${categoriesCode}.${entriesCode}.${configCode}`;
}

function splitOnFirstDelimiter (str = '', delimiter = ',') {
  const startIndex = str.indexOf(delimiter);
  let result;
  if (startIndex > -1) {
    result = [str.slice(0, startIndex), str.slice(startIndex + 1)];
  } else {
    result = [str];
  }
  return result;
}

export function parseTierListCode (code = '', hasUriComponents = false) {
  const cleanedCode = hasUriComponents ? decodeURIComponent(code) : code.slice();
  const [categoriesCode = '', entriesAndConfigCode = ''] = splitOnFirstDelimiter(cleanedCode, '.');
  const [entriesCode = '', configCode = ''] = splitOnFirstDelimiter(entriesAndConfigCode, '.');
  const categories = categoriesCode
    .split(',')
    .map(categoryCode => convertCodeToCategory(categoryCode))
    .filter(v => v);

  const rawEntries = entriesCode
    .split('!');
  const entries = categories.map((_, i) => {
    const categoryEntries = rawEntries[i] || '';
    return categoryEntries
      .split(',')
      .map(convertCodeToEntry)
      .filter(v => v);
  });

  const config = configCode
    .split('~')
    .map((pair = '') => {
      const [key = '', value = ''] = splitOnFirstDelimiter(pair, '!');
      let cleanedValue = value;
      if ((value.includes('{') && value.includes('}')) || (value.includes('[') && value.includes(']'))) {
        try {
          cleanedValue = JSON.parse(value);
        } catch {
          cleanedValue = value;
        }
      } else if (value === 'true' || value === 'false') {
        cleanedValue = value === 'true';
      } else if (value === 'null') {
        cleanedValue = null;
      } else if (value === 'undefined') {
        cleanedValue = undefined;
      } else if (!isNaN(value) && value !== '') {
        cleanedValue = +value;
      }
      return [key, cleanedValue];
    }).reduce((acc, [key, value]) => {
      if (key) {
        acc[key] = value;
      }
      return acc;
    }, {});
  return {
    categories,
    entries,
    config,
  };
}

export function fetchBase64Png (url = '') {
  const BASE_URL = 'https://macabre-broomstick-39921.herokuapp.com/getImage';
  return fetch(`${BASE_URL}/${encodeURIComponent(url)}?format=text/plain`)
    .then(res => res.ok
        ? res.text()
        : Promise.reject(res.statusText)
    ).then(b64 => `data:image/png;base64,${b64}`);
}

export function getDefaultCategories () {
  return [
    {
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
