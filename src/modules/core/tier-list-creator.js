import colors from 'vuetify/es5/util/colors';
import { convertCompareCodeToInput } from './compare';

const DEFAULT_FONT_SIZE = 16;
const DEFAULT_FONT_WEIGHT = 'normal';
const DEFAULT_TEXT_DECORATION = 'unset';
const DEFAULT_FONT_STYLE = 'normal';
const SHORTHAND_MAPPINGS = Object.freeze([
  ['footerLeft', 'fL'],
  ['titleLeft', 'tL'],
  ['titleMiddle', 'tM'],
  ['titleRight', 'tR'],
  ['unitNumberPosition', 'uNP'],
  ['unitNumberStroke', 'uNSC'],
  ['unitNumberFill', 'uNFC'],
  ['unitNumberSize', 'uNS'],
  ['imageType', 'iT'],
  ['scaleFactor', 'sF'],
  ['maxEntriesPerRow', 'mEPR'],
]);
const FULL_TO_SHORT_FONT_ATTRIBUTE_MAPPINGS = Object.freeze([
  ['normal', 'n'],
  ['unset', 'u'],
  ['bold', 'b'],
  ['italic', 'i'],
  ['underline', 'l'],
]);
const SHORT_TO_FULL_FONT_ATTRIBUTE_MAPPINGS = FULL_TO_SHORT_FONT_ATTRIBUTE_MAPPINGS.map(([full, short]) => [short, full]);

export function convertCodeToCategory (input = '', isUriComponent) {
  const [name = 'Category', textColor, backgroundColor, fontSize = DEFAULT_FONT_SIZE, fontModifications = 'nun'] = input.split('-');
  const [fontWeight = DEFAULT_FONT_WEIGHT, textDecoration = DEFAULT_TEXT_DECORATION, fontStyle = DEFAULT_FONT_STYLE] = fontModifications.split('').map((c) => replaceWithMapping(c[0], SHORT_TO_FULL_FONT_ATTRIBUTE_MAPPINGS));

  return {
    name: isUriComponent ? decodeURIComponent(name) : name,
    // text and background color are hex values without hashes
    textColor: textColor ? `#${textColor}` : colors.shades.black,
    backgroundColor: backgroundColor ? `#${backgroundColor}` : colors.shades.white,
    fontSize: (!isNaN(fontSize) && +fontSize > 0) ? fontSize : DEFAULT_FONT_SIZE,
    fontWeight,
    textDecoration,
    fontStyle,
  };
}

function replaceCharacters (str = '', replacementMapping = []) {
  let currentStr = str.slice();
  replacementMapping.forEach(([oldChar, newChar]) => {
    currentStr = currentStr.replace(oldChar, newChar);
  });
  return currentStr;
}

function replaceWithMapping (str = '', replacementMapping = []) {
  const mapPair = replacementMapping.find(([key]) => key === str) || [];
  return mapPair[1] || str;
}

export function convertCategoryToCode ({
  name = '',
  textColor,
  backgroundColor,
  fontSize = DEFAULT_FONT_SIZE,
  fontWeight = DEFAULT_FONT_WEIGHT,
  textDecoration = DEFAULT_TEXT_DECORATION,
  fontStyle = DEFAULT_FONT_STYLE,
}) {
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
  const fontModifications = [fontWeight, textDecoration, fontStyle]
    .map((v) => replaceWithMapping(v, FULL_TO_SHORT_FONT_ATTRIBUTE_MAPPINGS))
    .join('');
  return `${cleanedName}-${textColorCode}-${backgroundColorCode}-${fontSize}-${fontModifications}`;
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
      const keyMap = SHORTHAND_MAPPINGS.find(([originalKey]) => originalKey === key) || [];
      const shorthandKey = keyMap[1] || key;
      return `${shorthandKey}!${value}`;
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
        const keyMap = SHORTHAND_MAPPINGS.find(([, shorthandKey]) => shorthandKey === key) || [];
        const originalKey = keyMap[0] || key;
        acc[originalKey] = value;
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
