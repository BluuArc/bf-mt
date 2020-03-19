const fs = require('fs');
const axios = require('axios');
const GitHubScraper = require('./gh-scraper');
const CliLogger = require('./cli-logger');
const PROC_PASSIVE_METADATA = require('./src/assets/buff-translation/passive-proc-metadata.json');
const ATTACKING_PROCS = Object.keys(PROC_PASSIVE_METADATA.proc).filter(id => PROC_PASSIVE_METADATA.proc[id].Type === 'Attack');
const TARGET_AREA_MAPPING = Object.freeze({
  aoe: 'AOE',
  single: 'ST',
  random: 'RT',
});
const BURST_TYPES = ['bb', 'sbb', 'ubb'];
const MOVE_TYPE_MAPPING = Object.freeze({
  1: 'Moving',
  2: 'Teleporting',
  3: 'Non-Moving',
});

const logger = new CliLogger('DOWNLOADER');

const outputFolder = 'public/static/bf-data';

const config = {
  getStats: true,
  processData: true,
  useLocal: false,
};

function extractBuffsFromTriggeredEffect (effect = {}, sourcePath) {
  return Array.isArray(effect['triggered effect'])
    ? Array.from(effect['triggered effect']).map(e => {
      const mappedEffect = { ...e, sourcePath };
      BURST_TYPES.forEach(burstType => {
        const key = `trigger on ${burstType}`;
        if (effect[key]) {
          mappedEffect[key] = true;
        }
      });
      return mappedEffect;
    })
    : [];
}

function getAttackingEffectsForEffectsList (effects = [], sourcePath, getDamageFramesForIndex = () => ({ hits: 0 })) {
  const procTransformer = (e, i) => ({
    id: `${e['proc id'] || e['unknown proc id']}`,
    target: TARGET_AREA_MAPPING[e['random attack'] ? 'random' : e['target area']],
    ...(BURST_TYPES.reduce((acc, burstType) => {
      if (e[`trigger on ${burstType}`]) {
        acc[burstType] = true;
      }
      return acc;
    }, {})),
    sourcePath: e.sourcePath,
    hits: e.hits || (getDamageFramesForIndex(i) || {}).hits || 0,
  });
  const attackFilter = e => ATTACKING_PROCS.includes(e.id);
  const effectsWithIndices = effects.map((e, i) => ({ ...e, originalIndex: i }));
  const triggeredEffects = effectsWithIndices.filter(e => e['triggered effect']);

  // if triggered effect, then input list is set of passives, which don't have procs
  let result = [];
  if (triggeredEffects.length > 0) {
    result = triggeredEffects.map(e => extractBuffsFromTriggeredEffect(e, sourcePath))
      .reduce((acc, list) => acc.concat(list), []);
  } else {
    result = effectsWithIndices.filter(e => e['proc id'] || e['unknown proc id']);
  }
  return result.map(e => procTransformer(e, e.originalIndex))
    .filter(attackFilter);
}

function getFinalBurstEntry (burst = {}) {
  const burstEntriesByLevel = Array.isArray(burst.levels) ? burst.levels : [];
  return burstEntriesByLevel[burstEntriesByLevel.length - 1];
}

function getAttackInfoForBurst (burst = {}) {
  const finalBurstEntry = getFinalBurstEntry(burst);
  if(!finalBurstEntry) {
    return [];
  }
  return getAttackingEffectsForEffectsList(finalBurstEntry.effects, undefined, (i) => burst['damage frames'][i]);
}

function getHitCountData (burst, filterFn = (f) => ATTACKING_PROCS.includes(f.id)) {
  if (typeof burst !== 'object' || Object.keys(burst).length === 0) {
    return [];
  }
  const endLevel = getFinalBurstEntry(burst);
  return burst['damage frames']
    .map((f, i) => {
      const effectData = endLevel.effects[i];
      return {
        target: TARGET_AREA_MAPPING[effectData['random attack'] ? 'random' : effectData['target area']],
        id: (f['proc id'] || f['unknown proc id'] || f.id || '').toString(),
        frames: f,
        delay: effectData['effect delay time(ms)/frame'],
        effects: effectData,
      };
    }).filter(filterFn);
}

function getExtraAttackFrames (burst) {
  const attackFrameSets = getHitCountData(burst).map(d => d.frames);
  const healFrameSets = getHitCountData(burst, e => e.id === '2').map(d => d.frames);

  let frameTimes = [];
  let hitDmgDistribution = [];

   // gather frame data
  attackFrameSets.forEach((frameSet, i) => {
    const keepFirstFrame = i === 0;
    frameTimes = frameTimes.concat(frameSet['frame times'].slice(keepFirstFrame ? 0 : 1));
    hitDmgDistribution = hitDmgDistribution.concat(frameSet['hit dmg% distribution'].slice(keepFirstFrame ? 0 : 1));
  });

  healFrameSets.forEach((frameSet, i) => {
    const keepFirstFrame = i === 0 && attackFrameSets.length === 0;
    frameTimes = frameTimes.concat(frameSet['frame times'].slice(keepFirstFrame ? 0 : 1));
    hitDmgDistribution = hitDmgDistribution.concat(frameSet['hit dmg% distribution'].slice(keepFirstFrame ? 0 : 1));
  });

  // sort frames by frame time
  const unifiedFrames = [];
  frameTimes.forEach((time, i) => {
    unifiedFrames.push({
      time,
      dmg: hitDmgDistribution[i],
    });
  });

  const frames = {
    'frame times': [],
    'hit dmg% distribution': [],
  };
  unifiedFrames.sort((a, b) => a.time - b.time).forEach(({ time, dmg }) => {
    frames['frame times'].push(time);
    frames['hit dmg% distribution'].push(dmg);
  });
  frames.hits = frames['frame times'].length;
  return frames;
}

function getAttackInfoForUnit (unit = {}) {
  const attackInfo = {};
  const extraAttackInfo = {};

  if (unit['damage frames']) {
    attackInfo.normal = [
      {
        id: '1',
        target: 'ST',
        hits: unit['damage frames'].hits,
        moveType: unit.movement && MOVE_TYPE_MAPPING[(unit.movement.attack || {})['move type']] || undefined,
      },
    ];
  }

  // check BB, SBB, and UBB and add accordingly
  BURST_TYPES.forEach(burstType => {
    if (unit[burstType]) {
      attackInfo[burstType] = getAttackInfoForBurst(unit[burstType]);
      extraAttackInfo[burstType] = getExtraAttackFrames(unit[burstType]);
    }
  });

  // check LS, ES, and SP for extra attacks
  [
    {
      key: 'leader skill',
      name: 'LS',
    },
    {
      key: 'extra skill',
      name: 'ES',
    },
  ].forEach(({ key, name }) => {
    if (unit[key]) {
        BURST_TYPES.forEach(burstType => {
          if (attackInfo[burstType]) {
            const mappedEffects = getAttackingEffectsForEffectsList(unit[key].effects, name, () => extraAttackInfo[burstType]);
            attackInfo[burstType] = attackInfo[burstType].concat(mappedEffects.filter(e => e[burstType]));
          }
        });
    }
  });

  if (unit.feskills) {
    const allEffects = unit.feskills
      .map(s => s.skill.effects)
      .reduce((acc, effectsArr) => acc.concat(effectsArr), [])
      .filter(s => s.passive)
      .map(s => s.passive);
    BURST_TYPES.forEach(burstType => {
      if (attackInfo[burstType]) {
        const mappedEffects = getAttackingEffectsForEffectsList(allEffects, 'SP', () => extraAttackInfo[burstType]);
        attackInfo[burstType] = attackInfo[burstType].concat(mappedEffects.filter(e => e[burstType]));
      }
    });
  }

  const moveTypeForBursts = unit.movement && MOVE_TYPE_MAPPING[(unit.movement.skill || {})['move type']] || undefined;
  if (moveTypeForBursts) {
    BURST_TYPES.forEach(burstType => {
      if (attackInfo[burstType]) {
        attackInfo[burstType] = attackInfo[burstType].map(entry => ({ ...entry, moveType: moveTypeForBursts }));
      }
    });
  }
  return attackInfo;
}

let ghData;
const updateData = initializeTimeData();

const rangeData = {
  units: [1, 6],
  items: [0, 9],
  bbs: [0, 9],
  dictionary: [0, 9],
};

const handlers = {
  units: {
    setGitData (server = 'gl') {
      logger.info(`${server}: setting git data`);
      try {
        const fileDate = ['info.json', 'evo_list.json', 'feskills.json']
          .map(f => getGitData(f, server).date)
          .reduce((acc, val) => Math.max(acc, new Date(val)), new Date('Jan 01 1969'));
        updateData.units[server] = new Date(fileDate).toISOString();
      } catch (err) { logger.error('error setting git data', err).errDone().errDone(); }
    },
    async download (server = 'gl') {
      const data = {
        info: {
          file: 'info.json',
          data: {},
        },
        evo_list: {
          file: 'evo_list.json',
          data: {},
        },
        feskills: {
          file: 'feskills.json',
          data: {},
        },
      };

      logger.info(`${server}: getting files`);
      const unitUrls = [];
      Object.keys(data).map(key => data[key].file)
        .forEach(f => {
          unitUrls.push(getUrl(server, f));
        });
      const downloadResult = await downloadMultipleFiles(unitUrls, unitUrls.length);
      // convert to JSON if necessary
      downloadResult.map(r => {
        if (typeof r.data === "string") {
          r.data = JSON.parse(r.data);
        }
        return r;
      }).forEach(r => {
        // eslint-disable-next-line no-unused-vars
        const [name, extension] = r.url.split('.');
        data[name].data = r.data;
      });

      logger.debug('info', Object.keys(data.info.data).length).done();

      const [info, evo_list, feskills] = [data.info.data, data.evo_list.data, data.feskills.data];
      return { info, evo_list, feskills };
    },
    // eslint-disable-next-line no-unused-vars
    process (server, { info = {}, evo_list = {}, feskills = {} }, missions = {}, dictionary = {}) {
      const elements = ['fire', 'water', 'earth', 'thunder', 'light', 'dark'];
      logger.info(`${server}: merging files`);
      Object.keys(evo_list).forEach(id => {
        const entry = evo_list[id];
        const curUnit = info[id],
          nextUnit = info[entry.evo.id.toString()];

        if (!curUnit) {
          logger.warn(`Can't add evo data to current unit ${id} as entry is missing`).done();
          return;
        } else if (!nextUnit) {
          logger.warn(`Can't add evo data to next unit ${entry.evo.id} as entry is missing`).done();
          return;
        }

        curUnit.evo_mats = entry.mats;
        curUnit.evo_cost = entry.amount;
        curUnit.next = nextUnit.id.toString();
        nextUnit.prev = curUnit.id.toString();
      });

      Object.keys(feskills).forEach(id => {
        const entry = feskills[id];
        const unit = info[id];
        if (!unit) {
          logger.warn(`Can't add SP data to unit ${id} as entry is missing`).done();
          return;
        }
        unit.feskills = entry.skills;
      });

      Object.values(missions)
        .filter(({ clear_bonus = [] }) => clear_bonus.length > 0)
        .forEach(({ clear_bonus = [], id = '' }) => {
          clear_bonus.forEach(bonus => {
            if (bonus.unit) {
              const unit = info[bonus.unit.id.toString()];
              if (unit) {
                if (!unit.first_clear_missions) {
                  unit.first_clear_missions = [];
                }
                unit.first_clear_missions.push(id.toString());
              }
            }
          });
        });
        Object.values(info)
          .forEach(unit => {
            unit.attackInfo = getAttackInfoForUnit(unit);
            if (unit.movement && unit.movement.attack && unit.movement.skill && unit.movement.attack['move type'] !== unit.movement.skill['move type']) {
              logger.warn(`Movement types for attack and skill don't match for unit ${unit.id}`).done();
            }
          });
      // TODO: add support for dictionary

      // save data into files separated by element
      logger.info(`${server}: saving files`);
      elements.forEach((element, index) => {
        const fileData = {};
        Object.keys(info)
          .filter(id => info[id].element === element)
          .forEach(id => {
            fileData[id] = info[id];
          });

        logger.debug(`fileData ${element}`, Object.keys(fileData).length);
        const filename = `units-${server}-${index+1}.json`;
        fs.writeFileSync(`${outputFolder}/${filename}`, JSON.stringify(fileData, null, 2), 'utf8');
        logger.info(`${server}: saved ${filename}`).done();
      });
      return info;
    },
    load (server = 'gl') {
      return loadData('units', server);
    },
  },
  items: {
    setGitData (server = 'gl') {
      logger.info(`${server}: setting git data`);
      try {
        const fileDate = getGitData('items.json', server).date;
        updateData.items[server] = new Date(fileDate).toISOString();
      } catch (err) { logger.error('error setting git data', err).errDone(); }
    },
    async download (server = 'gl') {
      const itemData = {};
      logger.info(`${server}: getting files`);
      const downloadResult = await downloadMultipleFiles([getUrl(server, 'items.json')]);
      downloadResult.map(r => {
        if (typeof r.data === "string") {
          r.data = JSON.parse(r.data);
        }
        return r;
      }).forEach(r => {
        const { data } = r;
        Object.keys(data)
          .forEach(key => {
            itemData[key] = data[key];
          });
      });
      logger.debug('itemData', Object.keys(itemData).length).done();
      return itemData;
    },
    // eslint-disable-next-line no-unused-vars
    process (server, itemData = {}, unitData = {}, missions = {}, dictionary = {}) {
      logger.info(`${server}: setting recipe names`);
      Object.values(itemData)
        .forEach(item => {
          if (item.recipe) {
            for (const mat of item.recipe.materials) {
              if (!itemData[mat.id]) {
                logger.warn(`no entry found for item ${mat.id} in recipe of ${item.id}`).done();
                mat.name = mat.id.toString();
              } else {
                mat.name = itemData[mat.id].name;
              }
            }
          }
        });

      logger.info(`${server}: creating usage lists`);
      //for every item
      Object.values(itemData)
        .forEach(item => {
          item.usage = [];
          //for every other item with a recipe
          Object.values(itemData)
            .forEach(otherItem => {
              if (otherItem.recipe !== undefined && otherItem.id !== item.id) {
                //for every material in the other item
                for (const mat of otherItem.recipe.materials) {
                  if (mat.id === item.id) {
                    item.usage.push({
                      id: otherItem.id,
                      name: otherItem.name,
                    });
                  }
                }
              }
            });
        });

      // for every unit
      const addUnitIdToItemId = (unitId, itemId, reason = 'evo') => {
        logger.debug([reason, 'attempting to add unit', unitId, 'to item', itemId].join(' '));
        const item = itemData[itemId.toString()];
        if (item) {
          if (!item.associated_units) {
            item.associated_units = [];
          }
          if (!item.associated_units.includes(unitId)) {
            item.associated_units.push(unitId);
          }
        } else {
          logger.warn(`Can't add unit ${unitId} because item ${itemId} is not found`).done();
        }
      };
      logger.info(`${server}: cross referencing unit data for usage`);
      Object.values(unitData)
        .forEach(unit => {
          const unitId = unit.id.toString();
          if (unit.evo_mats) {
            const itemMats = unit.evo_mats.filter(mat => mat.type === 'item').map(mat => mat.id);
            itemMats.forEach(itemId => addUnitIdToItemId(unitId, itemId, 'evo'));
          }

          if (unit['extra skill'] && unit['extra skill'].effects) {
            const conditionSets = unit['extra skill'].effects.map(e => e.conditions).filter(arr => arr.length > 0).reduce((arr, val) => arr.concat(val), []);
            conditionSets.forEach(conditionSet => {
              if (conditionSet['item required']) {
                if (Array.isArray(conditionSet['item required'])) {
                  conditionSet['item required'].forEach(itemId => addUnitIdToItemId(unitId, itemId, 'es'));
                } else {
                  addUnitIdToItemId(unitId, (conditionSet['item required'] || '').toString(), 'es');
                }
              }

              if (conditionSet['sphere category required (raw)']) {
                Object.values(itemData)
                  .filter(item => item['sphere type'] && item['sphere type'] === +conditionSet['sphere category required (raw)'])
                  .forEach(item => addUnitIdToItemId(unitId, item.id.toString(), 'es'));
              }
            });
          }
        });

      Object.values(missions)
        .filter(({ clear_bonus = [] }) => clear_bonus.length > 0)
        .forEach(({ clear_bonus = [], id = '' }) => {
          clear_bonus.forEach(bonus => {
            if (bonus.item) {
              const item = itemData[bonus.item.id.toString()];
              if (item) {
                if (!item.first_clear_missions) {
                  item.first_clear_missions = [];
                }
                item.first_clear_missions.push(id.toString());
              }
            }
          });
        });
      // TODO: add support for dictionary

      // split data into files based on first number of id
      logger.info(`${server}: saving files`);
      for (let i = 0; i <= 9; ++i) {
        const fileData = {};
        Object.keys(itemData)
          .filter(id => +id[0] === i)
          .forEach(id => {
            fileData[id] = itemData[id];
          });

        logger.debug(`fileData ${i}`, Object.keys(fileData).length);
        const filename = `items-${server}-${i}.json`;
        fs.writeFileSync(`${outputFolder}/${filename}`, JSON.stringify(fileData, null, 2), 'utf8');
        logger.info(`${server}: saved ${filename}`).done();
      }

      return itemData;
    },
    load (server = 'gl') {
      return loadData('items', server);
    },
  },
  bursts: {
    setGitData(server = 'gl') {
      logger.info(`${server}: setting git data`);
      try {
        let fileDate = new Date('Jan 01 1969');
        const folderData = (ghData[server] ? ghData[server].contents : undefined) || ghData;
        for (let i = 0; i <= 9; ++i) {
          const fileName = `bbs_${i}.json`;
          fileDate = folderData[fileName] ? Math.max(fileDate, new Date(folderData[fileName].date)) : fileDate;
        }
        updateData.bursts[server] = new Date(fileDate).toISOString();
      } catch (err) { logger.error('error setting git data', err).errDone(); }
    },
    async download(server = 'gl') {
      const bbData = {};
      logger.info(`${server}: getting files`);
      const files = [];
      for (let i = 0; i <= 9; ++i) {
        files.push(getUrl(server, `bbs_${i}.json`));
      }
      const downloadResult = await downloadMultipleFiles(files);
      downloadResult.map(r => {
        if (typeof r.data === "string") {
          r.data = JSON.parse(r.data);
        }
        return r;
      }).forEach(r => {
        const {
          data,
        } = r;
        Object.keys(data)
          .forEach(key => {
            bbData[key] = data[key];
          });
      });
      logger.debug('bbData', Object.keys(bbData).length).done();
      return bbData;
    },
    process (server, bbData = {}, unitData = {}) {
      logger.info(`${server}: setting unit associations`);
      Object.values(unitData)
        .forEach(unit => {
          BURST_TYPES.forEach(type => {
            if (unit[type]) {
              const burstId = unit[type].id;
              if (bbData[burstId]) {
                if (!bbData[burstId].associated_units) {
                  bbData[burstId].associated_units = [];
                }
                bbData[burstId].associated_units.push(unit.id.toString());
              } else {
                logger.warn(`No burst ID ${burstId} found in data from unit ${type} ${unit.id} (${unit.name})`).done();
              }
            }
          });
        });

      Object.values(bbData).forEach(burst => {
        burst.attackInfo = getAttackInfoForBurst(burst);
      });

      // split data into files based on first number of id
      logger.info(`${server}: saving files`);
      for (let i = 0; i <= 9; ++i) {
        const fileData = {};
        Object.keys(bbData)
          .filter(id => +id[0] === i)
          .forEach(id => {
            fileData[id] = bbData[id];
          });

        logger.debug(`fileData ${i}`, Object.keys(fileData).length);
        const filename = `bbs-${server}-${i}.json`;
        fs.writeFileSync(`${outputFolder}/${filename}`, JSON.stringify(fileData, null, 2), 'utf8');
        logger.info(`${server}: saved ${filename}`).done();
      }

      return bbData;
    },
    load(server = 'gl') {
      return loadData('bbs', server);
    },
  },
  extraSkills: {
    setGitData(server = 'gl') {
      logger.info(`${server}: setting git data`);
      try {
        const fileDate = getGitData('es.json', server).date;
        updateData.extraSkills[server] = new Date(fileDate).toISOString();
      } catch (err) { logger.error('error setting git data', err).errDone(); }
    },
    async download(server = 'gl') {
      const esData = {};
      logger.info(`${server}: getting files`);
      const downloadResult = await downloadMultipleFiles([getUrl(server, 'es.json')]);
      downloadResult.map(r => {
        if (typeof r.data === "string") {
          r.data = JSON.parse(r.data);
        }
        return r;
      }).forEach(r => {
        const { data } = r;
        Object.keys(data)
          .forEach(key => {
            esData[key] = data[key];
          });
      });
      logger.debug('esData', Object.keys(esData).length).done();
      return esData;
    },
    process (server, esData = {}, unitData = {}) {
      logger.info(`${server}: setting unit associations`);
      Object.values(unitData)
        .forEach(unit => {
          if (unit['extra skill']) {
            const esId = unit['extra skill'].id;
            if (esData[esId]) {
              if (!esData[esId].associated_units) {
                esData[esId].associated_units = [];
              }
              esData[esId].associated_units.push(unit.id.toString());
            } else {
              logger.warn(`No ES ID ${esId} found in data from unit ${unit.id} (${unit.name})`).done();
            }
          }
        });
      logger.info(`${server}: saving files`);
      const filename = `es-${server}.json`;
      fs.writeFileSync(`${outputFolder}/${filename}`, JSON.stringify(esData, null, 2), 'utf8');
      logger.info(`${server}: saved ${filename}`).done();
      return esData;
    },
    load(server = 'gl') {
      return loadData('es', server);
    },
  },
  leaderSkills: {
    setGitData(server = 'gl') {
      logger.info(`${server}: setting git data`);
      try {
        const fileDate = getGitData('ls.json', server).date;
        updateData.leaderSkills[server] = new Date(fileDate).toISOString();
      } catch (err) { logger.error('error setting git data', err).errDone(); }
    },
    async download(server = 'gl') {
      const lsData = {};
      logger.info(`${server}: getting files`);
      const downloadResult = await downloadMultipleFiles([getUrl(server, 'ls.json')]);
      downloadResult.map(r => {
        if (typeof r.data === "string") {
          r.data = JSON.parse(r.data);
        }
        return r;
      }).forEach(r => {
        const { data } = r;
        Object.keys(data)
          .forEach(key => {
            lsData[key] = data[key];
          });
      });
      logger.debug('lsData', Object.keys(lsData).length).done();
      return lsData;
    },
    process (server, lsData = {}, unitData = {}) {
      logger.info(`${server}: setting unit associations`);
      Object.values(unitData)
        .forEach(unit => {
          if (unit['leader skill']) {
            const lsId = unit['leader skill'].id;
            if (lsData[lsId]) {
              if (!lsData[lsId].associated_units) {
                lsData[lsId].associated_units = [];
              }
              lsData[lsId].associated_units.push(unit.id.toString());
            } else {
              logger.warn(`No LS ID ${lsId} found in data from unit ${unit.id} (${unit.name})`).done();
            }
          }
        });
      logger.info(`${server}: saving files`);
      const filename = `ls-${server}.json`;
      fs.writeFileSync(`${outputFolder}/${filename}`, JSON.stringify(lsData, null, 2), 'utf8');
      logger.info(`${server}: saved ${filename}`).done();
      return lsData;
    },
    load(server = 'gl') {
      return loadData('ls', server);
    },
  },
  missions: {
    setGitData(server = 'gl') {
      logger.info(`${server}: setting git data`);
      try {
        const fileDate = getGitData('missions.json', server).date;
        updateData.missions[server] = new Date(fileDate).toISOString();
      } catch (err) { logger.error('error setting git data', err).errDone(); }
    },
    async download(server = 'gl') {
      const missionData = {};
      logger.info(`${server}: getting files`);
      const downloadResult = await downloadMultipleFiles([getUrl(server, 'missions.json')]);
      downloadResult.map(r => {
        if (typeof r.data === "string") {
          r.data = JSON.parse(r.data);
        }
        return r;
      }).forEach(r => {
        const { data } = r;
        Object.keys(data)
          .forEach(key => {
            missionData[key] = data[key];
          });
      });
      logger.debug('missionData', Object.keys(missionData).length).done();
      return missionData;
    },
    process(server, missionData = {}, dictionaryData = {}) {
      logger.info(`${server}: translating missing land, area, and dungeon names`);
      const translationField = {
        land: 'MST_DUNGEONS_CONTINENT',
        area: 'MST_DUNGEONS_AREA',
        dungeon: 'MST_DUNGEONS_DUNGEON',
      };
      Object.values(missionData)
        .forEach(mission => {
          Object.keys(translationField)
            .forEach(locationType => {
              const dictionaryEntry = dictionaryData[`${translationField[locationType]}_${mission[locationType]}_NAME`];
              if (dictionaryEntry && dictionaryEntry.en) {
                mission[locationType] = dictionaryEntry.en;
              }
            });
        });

      logger.info(`${server}: saving files`);
      const filename = `missions-${server}.json`;
      fs.writeFileSync(`${outputFolder}/${filename}`, JSON.stringify(missionData, null, 2), 'utf8');
      logger.info(`${server}: saved ${filename}`).done();
      return missionData;
    },
    load(server = 'gl') {
      return loadData('missions', server);
    },
  },
  dictionary: {
    setGitData(server = 'gl') {
      logger.info(`${server}: setting git data`);
      try {
        let fileInfo = ghData['dictionary.json'];
        if (server !== 'gl') {
          logger.warn(`${server}: using GL dictionary data`).done();
          // fileInfo = ghData[server].contents['dictionary.json'];
        }
        updateData.dictionary[server] = fileInfo.date;
      } catch (err) { logger.error('error setting git data', err.errDone()); }
    },
    async download(server = 'gl') {
      logger.info(`${server}: getting files`);
      const dictionaryData = {};
      // NOTE: only GL dictionary data exists for now
      const downloadResult = await downloadMultipleFiles([getUrl('gl', 'dictionary.json')]);
      downloadResult.map(r => {
        if (typeof r.data === "string") {
          r.data = JSON.parse(r.data);
        }
        return r;
      }).forEach(r => {
        const { data } = r;
        Object.keys(data)
          .forEach(key => {
            dictionaryData[key] = data[key];
          });
      });
      logger.debug('dictionaryData', Object.keys(dictionaryData).length).done();
      return dictionaryData;
    },
    process (server, dictionaryData = {}) {
      // split data into 10 separate files
      logger.info(`${server}: saving files`);
      const maxLength = Math.floor(Object.keys(dictionaryData).length / 9);
      let currentIndex = 0;
      let keysAdded = 0;
      for (let i = 0; i <= 9; ++i) {
        const fileData = {};
        Object.keys(dictionaryData)
          .sort().slice(currentIndex, currentIndex + maxLength)
          .forEach(id => {
            fileData[id] = dictionaryData[id];
            keysAdded++;
          });
        logger.debug(`fileData ${i}`, Object.keys(fileData).length);
        logger.debug(`keys added so far`, keysAdded);
        const filename = `dictionary-${server}-${i}.json`;
        fs.writeFileSync(`${outputFolder}/${filename}`, JSON.stringify(fileData, null, 2), 'utf8');
        logger.info(`${server}: saved ${filename}`).done();
        currentIndex += maxLength;
      }
      logger.debug(`${server}: added all keys`, keysAdded === Object.keys(dictionaryData).length).done();

      return dictionaryData;
    },
    load(server = 'gl') {
      return loadData('dictionary', server);
    },
  },
};

function initializeTimeData () {
  try {
    return JSON.parse(fs.readFileSync(`${outputFolder}/update-stats.json`));
  } catch (err) {
    logger.error('error loading update-stats.json', err).errDone();
    logger.info('creating new time data instance');
    return {
      units: {},
      items: {},
      bursts: {},
      extraSkills: {},
      leaderSkills: {},
      missions: {},
      dictionary: {},
    };
  }
}

function getGitData (file, server = 'gl') {
  let fileInfo = ghData[file];
  if (server !== 'gl') {
    fileInfo = ghData[server].contents[file];
  }
  return fileInfo;
}

function loadData (type = 'units', server = 'gl') {
  logger.log(`loading local files for ${type} ${server}`);
  const result = {};
  if (rangeData[type]) {
    const [min, max] = rangeData[type];
    for (let i = min; i <= max; ++i) {
      const fileName = `${type}-${server}-${i}.json`;
      logger.debug(`loading ${fileName}`);
      const fileData = JSON.parse(fs.readFileSync(`public/static/bf-data/${fileName}`, 'utf8'));
      Object.keys(fileData).forEach(entryKey => {
        result[entryKey] = fileData[entryKey];
      });
    }
  } else {
    const fileName = `${type}-${server}.json`;
    logger.debug(`loading ${fileName}`);
    const fileData = JSON.parse(fs.readFileSync(`public/static/bf-data/${fileName}`, 'utf8'));
    Object.keys(fileData).forEach(entryKey => {
      result[entryKey] = fileData[entryKey];
    });
  }
  logger.log(`loaded local files for ${type} ${server}`, Object.keys(result).length).done();
  return result;
}

function getUrl(server = '', file = '') {
  const baseUrl = `https://raw.githubusercontent.com/Deathmax/bravefrontier_data/master`;

  if (server === 'gl') {
    return `${baseUrl}/${file}`;
  } else {
    return `${baseUrl}/${server}/${file}`;
  }
}

async function runWithRetry (fn = () => {}, numAttempts = 5) {
  let attempts = 0;
  let result;
  while (attempts < numAttempts) {
    logger.debug(`Attempt ${++attempts}/${numAttempts}: attempting to run function`);
    try {
      result = await Promise.resolve(fn());
      attempts = numAttempts;
    } catch (err) {
      logger.warn(`Error occurred during attempt ${attempts}/${numAttempts}`, err).done();
      if (attempts >= numAttempts) {
        throw err;
      }
    }
  }
  return result;
}

// assumption: files with the same name aren't being downloaded
function downloadMultipleFiles(urlArr = [], numConcurrent = 1, delay = 1000) {
  const getFilenameFromUrl = (url) => url.slice(url.lastIndexOf("/") + 1);
  const localArr = urlArr.slice();
  const filenames = localArr.map(getFilenameFromUrl);
  const result = [];
  let count = localArr.length;
  const helper = (successCb, failureCb) => {
    if (localArr.length === 0) {
      successCb(result);
    } else {
      const localPromises = [];
      for (let i = 0; i < numConcurrent && localArr.length > 0; ++i) {
        const url = localArr.shift();
        const filename = getFilenameFromUrl(url);
        logger.debug(`downloading ${filename} from ${url}`);
        localPromises.push(
          runWithRetry(() => axios.get(url)
            .then(response => {
              result.push({
                url: filename, // get file name
                data: response.data,
              });
              const remaining = filenames.filter(f => !result.some(r => r.url === f));
              logger.debug(`got ${filename}; ${--count} remaining [${remaining.join(', ')}]`).done();
              if (count > 0) {
                return new Promise((resolve) => setTimeout(resolve, delay));
              }
            }))
        );
      }

      Promise.all(localPromises)
        .then(() => helper(successCb, failureCb))
        .catch(failureCb);
    }
  };

  return new Promise((fulfill, reject) => {
    helper(fulfill, reject);
  });
}

async function getUnitDataForServer(server = 'gl', missionData = {}, dictionaryData = {}) {
  if (config.getStats) {
    handlers.units.setGitData(server);
  }
  if (!config.processData) {
    return {};
  }
  let unitData;
  if (!config.useLocal) {
    unitData = await handlers.units.download(server);
  } else {
    unitData = {
      info: handlers.units.load(server),
    };
  }
  return handlers.units.process(server, unitData, missionData, dictionaryData);
}

async function getBurstDataForServer(server = 'gl', unitData = {}) {
  if (config.getStats) {
    handlers.bursts.setGitData(server);
  }
  if (!config.processData) {
    return {};
  }
  let burstData;
  if (!config.useLocal) {
    burstData = await handlers.bursts.download(server);
  } else {
    burstData = handlers.bursts.load(server);
  }
  return handlers.bursts.process(server, burstData, unitData);
}

async function getExtraSkillDataForServer(server = 'gl', unitData = {}) {
  if (config.getStats) {
    handlers.extraSkills.setGitData(server);
  }
  if (!config.processData) {
    return {};
  }
  let esData;
  if (!config.useLocal) {
    esData = await handlers.extraSkills.download(server);
  } else {
    esData = handlers.extraSkills.load(server);
  }
  return handlers.extraSkills.process(server, esData, unitData);
}

async function getItemDataForServer(server = 'gl', unitData = {}, missionData = {}, dictionaryData = {}) {
  if (config.getStats) {
    handlers.items.setGitData(server);
  }
  if (!config.processData) {
    return {};
  }
  let itemData;
  if (!config.useLocal) {
    itemData = await handlers.items.download(server);
  } else {
    itemData = handlers.items.load(server);
  }
  return handlers.items.process(server, itemData, unitData, missionData, dictionaryData);
}

async function getLeaderSkillDataForServer(server = 'gl', unitData = {}) {
  if (config.getStats) {
    handlers.leaderSkills.setGitData(server);
  }
  if (!config.processData) {
    return {};
  }
  let lsData;
  if (!config.useLocal) {
    lsData = await handlers.leaderSkills.download(server);
  } else {
    lsData = handlers.leaderSkills.load(server);
  }
  return handlers.leaderSkills.process(server, lsData, unitData);
}

async function getMissionsForServer(server = 'gl', dictionaryData = {}) {
  if (config.getStats)  {
    handlers.missions.setGitData(server);
  }
   if (!config.processData) {
     return {};
   }
   let missionData;
   if (!config.useLocal) {
     missionData = await handlers.missions.download(server);
   } else {
     missionData = handlers.missions.load(server);
   }
   return handlers.missions.process(server, missionData, dictionaryData);
}

// TODO: implement usage for this
async function getDictionaryForServer(server = 'gl') {
  if (config.getStats) {
    handlers.dictionary.setGitData(server);
  }
  if (!config.processData) {
    return {};
  }

  let dictionaryData;
  if (!config.useLocal) {
    dictionaryData = await handlers.dictionary.download(server);
  } else {
    dictionaryData = handlers.dictionary.load(server);
  }
  return handlers.dictionary.process(server, dictionaryData);
}

function getUnitDictionaryDataForServer(server = 'gl', dictionaryData = {}, unitData = {}) {
  logger.info(`${server}: getting unit-dictionary assocations`);
  const result = {};
  const keyPrefix = `MST_UNITCOMMENT`;
  const fields = ['summon', 'fusion', 'evolution', 'description'];
  Object.keys(unitData).forEach(id => {
    const entry = {};
    let hasEntry = false;
    fields.forEach(field => {
      const dictKey = [keyPrefix, id.toString(), field.toUpperCase()].join('_');
      if (dictionaryData[dictKey] && dictionaryData[dictKey].en) {
        // use English translation only, if possible
        entry[field] = dictionaryData[dictKey].en;
        hasEntry = true;
      }
    });
    if (hasEntry) {
      result[id.toString()] = entry;
    }
  });
  logger.info(`${server}: saving files`);
  const filename = `unit-dictionary-${server}.json`;
  fs.writeFileSync(`${outputFolder}/${filename}`, JSON.stringify(result, null, 2), 'utf8');
  logger.info(`${server}: saved ${filename}`).done();
  return result;
}

function getItemDictionaryDataForServer(server = 'gl', dictionaryData = {}, itemData = {}) {
  logger.info(`${server}: getting item-dictionary assocations`);
  const result = {};
  const possibleFields = ['ITEMS_BATTLEITEMS', 'ITEMS_MATERIAL', 'LSSPHERE', 'SPHERES'];
  const generateDictKey = (id, fieldType) => ['MST', fieldType, id, 'LONGDESCRIPTION'].join('_');
  // check if there's a dictionary entry for every item id
  Object.keys(itemData).forEach(id => {
    const dictEntry = possibleFields.reduce((acc, type) => acc || dictionaryData[generateDictKey(id, type)], undefined);
    if (dictEntry && dictEntry.en) {
      result[id.toString()] = {
        lore: dictEntry.en,
      };
    }
  });
  logger.info(`${server}: saving files`);
  const filename = `item-dictionary-${server}.json`;
  fs.writeFileSync(`${outputFolder}/${filename}`, JSON.stringify(result, null, 2), 'utf8');
  logger.info(`${server}: saved ${filename}`).done();
  return result;
}

async function getData(servers = ['gl', 'eu', 'jp']) {
  if (!config.processData) {
    logger.info('Getting GH stats only');
  }
  if (config.getStats) {
    await initializeGHData();
  }
  logger.done();
  // TODO: implement use of dictionary data
  for (const s of servers) {
    const dictionaryData = await getDictionaryForServer(s);
    const missionData = await getMissionsForServer(s, dictionaryData);
    const unitData = await getUnitDataForServer(s, missionData);
    const itemData = await getItemDataForServer(s, unitData, missionData);
    await getBurstDataForServer(s, unitData);
    await getExtraSkillDataForServer(s, unitData);
    await getLeaderSkillDataForServer(s, unitData);

    getUnitDictionaryDataForServer(s, dictionaryData, unitData);
    getItemDictionaryDataForServer(s, dictionaryData, itemData);
  }


  logger.info(`saving update statistics file`);
  const filename = `update-stats.json`;
  fs.writeFileSync(`${outputFolder}/${filename}`, JSON.stringify(updateData, null, 2), 'utf8');
  logger.info(`saved ${filename}`).done();
  return;
}

async function initializeGHData() {
  logger.info('Initializing git file data');
  const scraper = new GitHubScraper();
  ghData = await scraper.getFileTree('https://github.com/cheahjs/bravefrontier_data');
  await scraper.close();
  fs.writeFileSync(`${outputFolder}/filetree.json`, JSON.stringify(ghData, null, 2), 'utf8');
  // logger.debug('ghData', ghData);
}

getData();
