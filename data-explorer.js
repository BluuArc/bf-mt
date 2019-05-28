const fs = require('fs');

const data = {
  units: {},
  items: {},
  bbs: {},
  es: {},
  ls: {},
  missions: {},
};

const servers = ['gl', 'eu', 'jp'];
const dataRangeSymbol = Symbol("data range");
data.units[dataRangeSymbol] = [1, 6];
data.items[dataRangeSymbol] = [0, 9];
data.bbs[dataRangeSymbol] = [0, 9];

function loadData() {
  Object.keys(data).forEach(type => {
    servers.forEach(server => {
      console.log(`loading files for ${type} ${server}`);
      const aggregate = {};
      if (data[type][dataRangeSymbol]) {
        const [min, max] = data[type][dataRangeSymbol];
        for (let i = min; i <= max; ++i) {
          const fileData = JSON.parse(fs.readFileSync(`public/static/bf-data/${type}-${server}-${i}.json`, 'utf8'));
          Object.keys(fileData).forEach(entryKey => {
            aggregate[`${entryKey}-${server}`] = fileData[entryKey];
          });
        }
      } else {
        const fileData = JSON.parse(fs.readFileSync(`public/static/bf-data/${type}-${server}.json`, 'utf8'));
        Object.keys(fileData).forEach(entryKey => {
          aggregate[`${entryKey}-${server}`] = fileData[entryKey];
        });
      }

      data[type] = { ...data[type], ...aggregate};
    });
  });
}

function _handleSingleObject(objectToSearch, doesObjectFit, objectFitsHandler, context = []) {
  if (typeof objectToSearch === "object" && doesObjectFit(objectToSearch)) {
    objectFitsHandler(objectToSearch, context);
  }
}

function getAllPossibleValuesOfObjectThatFitsCondition(objectToSearch, doesObjectFit, objectFitsHandler, context = [], firstCall = true) {
  console.log('context', context);
  if (firstCall) {
    _handleSingleObject(objectToSearch, doesObjectFit, objectFitsHandler);
  }

  let valuesToIterate = [];
  if (typeof objectToSearch === "object" || Array.isArray(objectToSearch)) {
    valuesToIterate = Object.keys(objectToSearch);
  }
  valuesToIterate = valuesToIterate.filter(key => {
    const value = objectToSearch[key] || objectToSearch[+key];
    return value !== undefined && value !== null && (typeof value === "object" || Array.isArray(value));
  }).forEach(key => {
    const value = objectToSearch[key] || objectToSearch[+key];
    const tempContext = [...context, key];
    _handleSingleObject(value, doesObjectFit, objectFitsHandler, tempContext);
    getAllPossibleValuesOfObjectThatFitsCondition(value, doesObjectFit, objectFitsHandler, tempContext, false);
  });
}

function addValueToAggregate(aggregate = {}, key = '', { inputValue = {}, context = {} }) {
  if (!aggregate[key]) {
    aggregate[key] = [];
  }

  const currentValues = aggregate[key].map(entry => entry.value);
  const value = (typeof inputValue === "object" || Array.isArray(inputValue)) ? JSON.stringify(inputValue) : inputValue.toString();
  if (!currentValues.includes(value)) {
    aggregate[key].push({ value, context });
  }
}

function readProcValues() {
  console.log("reading proc values");
  const aggregate = {
    proc: {},
    unknown_proc: {},
  };
  const doesFit = (input) => input['proc id'] || input['unknown proc id'];
  const addToAccumulator = (input, context) => {
    const fieldToIgnore = ['proc id', 'unknown proc id', 'hit dmg% distribution', 'frame times'];
    const id = (input['proc id'] || input['unknown proc id']).toString();
    const buffAggregate = (input['proc id'] ? aggregate.proc : aggregate.unknown_proc);
    if (!buffAggregate[id]) {
      buffAggregate[id] = {};
    }
    const localAggregate = buffAggregate[id];
    Object.keys(input).filter(k => !fieldToIgnore.includes(k))
      .forEach(key => addValueToAggregate(localAggregate, key, { inputValue: input[key], context }));
  };
  getAllPossibleValuesOfObjectThatFitsCondition(data, doesFit, addToAccumulator);
  return aggregate;
}

function readPassiveValues() {
  console.log("reading passive values");
  const aggregate = {
    passive: {},
    unknown_passive: {},
  };
  const doesFit = (input) => input['passive id'] || input['unknown passive id'];
  const addToAccumulator = (input, context) => {
    const fieldToIgnore = ['passive id', 'unknown passive id'];
    const id = (input['passive id'] || input['unknown passive id']).toString();
    const buffAggregate = (input['passive id'] ? aggregate.passive : aggregate.unknown_passive);
    if (!buffAggregate[id]) {
      buffAggregate[id] = {};
    }
    const localAggregate = buffAggregate[id];
    Object.keys(input).filter(k => !fieldToIgnore.includes(k))
      .forEach(key => addValueToAggregate(localAggregate, key, { inputValue: input[key], context }));
  };
  getAllPossibleValuesOfObjectThatFitsCondition(data, doesFit, addToAccumulator);
  return aggregate;
}

function readBuffValues() {
  console.log("reading miscellaneous buff values");
  const aggregate = {
    buff: {},
    unknown_buff: {},
  };
  const doesFit = (input) => Object.keys(input).filter(key => key.includes('buff id')).length > 0;
  const addToAccumulator = (input, context) => {
    const fieldToIgnore = ['buff id', 'unknown buff id'];
    const possibleIdKeys = Object.keys(input).filter(key => key.includes('buff id'));
    const id = input[possibleIdKeys[0]].toString();
    const buffAggregate = (possibleIdKeys[0].includes('unknown') ? aggregate.unknown_buff : aggregate.buff);
    if (!buffAggregate[id]) {
      buffAggregate[id] = {};
    }
    const localAggregate = buffAggregate[id];
    Object.keys(input).filter(k => !fieldToIgnore.includes(k))
      .forEach(key => addValueToAggregate(localAggregate, key, { inputValue: input[key], context }));
  };
  getAllPossibleValuesOfObjectThatFitsCondition(data, doesFit, addToAccumulator);
  return aggregate;
}

function readMissionValues() {
  console.log("reading mission values");
  const aggregate = {};
  const doesFit = (input) => !!input.land || !!input.area;
  const addToAccumulator = (input, context) => {
    Object.keys(input).forEach(key => addValueToAggregate(aggregate, key, { inputValue: input[key], context }));
  };
  getAllPossibleValuesOfObjectThatFitsCondition(data.missions, doesFit, addToAccumulator);
  return aggregate;
}

function convertToIdKeysOnly (aggregate) {
  Object.keys(aggregate).forEach(type => {
    aggregate[type] = Object.keys(aggregate[type]);
  });
  return aggregate;
}

function scanForBuffIds () {
  const buffIdRegex = /(.+)(\s)\((\d+)\)$/;
  const extractBuffId = (propertyName = '') => {
    const match = propertyName.match(buffIdRegex);
    return {
      id: (match && match[3]) || (void 0),
      name: (match && match[1]) || (void 0),
    };
  };
  ['passives', 'procs'].forEach(mainBuffType => {
    const mainData = JSON.parse(fs.readFileSync(`public/static/bf-data/${mainBuffType}.json`, 'utf8'));
    const dataset = mainData[mainBuffType.slice(0, -1)];
    const mapping = {};
    Object.keys(dataset).forEach(buffId => {
      const buffEntry = dataset[buffId];
      Object.keys(buffEntry).forEach(property => {
        console.log(`processing ${mainBuffType} ${buffId} ${property}`);
        const buffIdEntry = extractBuffId(property);
        if (buffIdEntry.id !== (void 0)) {
          console.log(`adding ${mainBuffType} ${buffId} ${property}`);
          if (!mapping[buffIdEntry.id]) {
            mapping[buffIdEntry.id] = new Set();
          }
          const set = mapping[buffIdEntry.id];
          set.add(`${buffId}-${buffIdEntry.name}`);
        }
        console.log(`finished ${mainBuffType} ${buffId} ${property}`);
      });
    });
    const resultFileData = {};
    Object.keys(mapping).forEach(key => {
      resultFileData[key] = Array.from(mapping[key]);
      console.log(key, resultFileData[key]);
    });
    fs.writeFileSync(`public/static/bf-data/buffid-mapping-${mainBuffType}.json`, JSON.stringify(resultFileData, null, 2), 'utf8');
  });
}

function main() {
  loadData();
  const procValues = readProcValues();
  fs.writeFileSync("public/static/bf-data/procs.json", JSON.stringify(procValues, null, 2), 'utf8');
  fs.writeFileSync("public/static/bf-data/procs-ids.json", JSON.stringify(convertToIdKeysOnly(procValues), null, 2), 'utf8');

  const passiveValues = readPassiveValues();
  fs.writeFileSync("public/static/bf-data/passives.json", JSON.stringify(passiveValues, null, 2), 'utf8');
  fs.writeFileSync("public/static/bf-data/passives-ids.json", JSON.stringify(convertToIdKeysOnly(passiveValues), null, 2), 'utf8');

  const buffValues = readBuffValues();
  fs.writeFileSync("public/static/bf-data/other-buffs.json", JSON.stringify(buffValues, null, 2), 'utf8');
  fs.writeFileSync("public/static/bf-data/other-buffs-ids.json", JSON.stringify(convertToIdKeysOnly(buffValues), null, 2), 'utf8');

  const missionValues = readMissionValues();
  fs.writeFileSync("public/static/bf-data/missions.json", JSON.stringify(missionValues, null, 2), 'utf8');
  scanForBuffIds();
}

main();
