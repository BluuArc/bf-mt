const fs = require('fs');

const data = {
  units: {},
  items: {},
  bbs: {},
  es: {},
  ls: {},
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
          const fileData = JSON.parse(fs.readFileSync(`static/bf-data/${type}-${server}-${i}.json`, 'utf8'));
          Object.keys(fileData).forEach(entryKey => {
            aggregate[`${entryKey}-${server}`] = fileData[entryKey];
          });
        }
      } else {
        const fileData = JSON.parse(fs.readFileSync(`static/bf-data/${type}-${server}.json`, 'utf8'));
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
    return value !== undefined && value !== null && (typeof value === "object" || Array.isArray(value))
  }).forEach(key => {
    const value = objectToSearch[key] || objectToSearch[+key];
    const tempContext = [...context, key];
    _handleSingleObject(value, doesObjectFit, objectFitsHandler, tempContext);
    getAllPossibleValuesOfObjectThatFitsCondition(value, doesObjectFit, objectFitsHandler, tempContext, false);
  });
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
    // console.log('adding to proc', id);
    const buffAggregate = (!!input['proc id'] ? aggregate.proc : aggregate.unknown_proc);
    if (!buffAggregate[id]) {
      buffAggregate[id] = {};
    }
    const procAggregate = buffAggregate[id];
    Object.keys(input).filter(k => !fieldToIgnore.includes(k))
      .forEach(key => {
        if (!procAggregate[key]) {
          procAggregate[key] = [];
        }
        const currentValues = procAggregate[key].map(entry => entry.value);
        let inputValue = input[key];
        if (typeof inputValue === "object" || Array.isArray(inputValue)) {
          inputValue = JSON.stringify(inputValue);
        } else {
          inputValue = inputValue.toString();
        }
        if (!currentValues.includes(inputValue)) {
          procAggregate[key].push({ value: inputValue, context });
        }
      });
  };
  getAllPossibleValuesOfObjectThatFitsCondition(data, doesFit, addToAccumulator);
  return aggregate;
}

function main() {
  loadData();
  const procValues = readProcValues();
  fs.writeFileSync("static/bf-data/procs.json", JSON.stringify(procValues, null, 2), 'utf8');
}

main();
