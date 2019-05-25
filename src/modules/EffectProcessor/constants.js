import Procs from './procs';
import UnknownProcs from './unknown-procs';
import Passives from './passives';
import UnknownPassives from './unknown-passives';
const passiveProcMetadata = require('@/assets/buff-translation/passive-proc-metadata.json');

// TODO: dynamically created from effect processor
export const attackingProcs = Object.freeze(['1', '13', '14', '27', '28', '29', '47', '61', '64', '75', '11000'].concat(['46', '48', '97']));

const getSortVal = (item = '') => {
  // sort by number or the number from reverse order of concatenated char codes
  return !isNaN(item) ? +item : +Array.from(item).map(a => a.charCodeAt().toString()).reverse().join('');
};

export const procs = (() => {
  const formattedUnknownProcs = Object.keys(UnknownProcs).sort((a, b) => getSortVal(a) - getSortVal(b)).map(id => ({
    value: id,
    text: `[${id}] ${(passiveProcMetadata.proc[id] && passiveProcMetadata.proc[id].Name) || UnknownProcs[id].desc}`,
    data: UnknownProcs[id],
  }));
  const formattedProcs = Object.keys(Procs).filter(id => !UnknownProcs[id]).sort((a, b) => getSortVal(a) - getSortVal(b)).map(id => ({
    value: id,
    text: `[${id}] ${(passiveProcMetadata.proc[id] && passiveProcMetadata.proc[id].Name) || Procs[id].desc}`,
    data: Procs[id],
  }));
  return formattedProcs.concat(formattedUnknownProcs).sort((a, b) => getSortVal(a.value) - getSortVal(b.value));
})();

export const passives = (() => {
  const formattedUnknownPassives = Object.keys(UnknownPassives).sort((a, b) => getSortVal(a) - getSortVal(b)).map(id => ({
    value: id,
    text: `[${id}] ${(passiveProcMetadata.passive[id] && passiveProcMetadata.passive[id].Name) || UnknownPassives[id].desc}`,
    data: UnknownPassives[id],
  }));
  const formattedPassives = Object.keys(Passives).filter(id => !UnknownPassives[id]).sort((a, b) => getSortVal(a) - getSortVal(b)).map(id => ({
    value: id,
    text: `[${id}] ${(passiveProcMetadata.passive[id] && passiveProcMetadata.passive[id].Name) || Passives[id].desc}`,
    data: Passives[id],
  }));
  return formattedPassives.concat(formattedUnknownPassives).sort((a, b) => getSortVal(a.value) - getSortVal(b.value));
})();
