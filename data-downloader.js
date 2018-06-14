const fs = require('fs');
const rp = require('request-promise');
const logger = require('winston');
const GitHubScraper = require('./gh-scraper');
logger.level = 'debug';

const outputFolder = 'static/bf-data';

let ghData;
let updateData = {
  units: {},
  items: {},
  bursts: {},
  extraSkills: {},
  leaderSkills: {},
};

let statsOnly = false;

function getUrl(server = '', file = '') {
  const baseUrl = `https://raw.githubusercontent.com/Deathmax/bravefrontier_data/master`;

  if (server === 'gl') {
    return `${baseUrl}/${file}`;
  } else {
    return `${baseUrl}/${server}/${file}`;
  }
}

// assumption: files with the same name aren't being downloaded
function downloadMultipleFiles(urlArr = [], numConcurrent = 1) {
  const localArr = urlArr.slice();
  const result = [];
  let count = localArr.length;
  const helper = (successCb, failureCb) => {
    if (localArr.length === 0) {
      successCb(result);
    } else {
      const localPromises = [];
      for (let i = 0; i < numConcurrent && localArr.length > 0; ++i) {
        const url = localArr.shift();
        const filename = url.slice(url.lastIndexOf("/") + 1);
        logger.debug(`downloading ${filename} from ${url}`);
        localPromises.push(
          rp.get(url)
            .then(data => {
              logger.debug(`got ${filename}; ${--count} remaining`);
              result.push({
                url: filename, // get file name
                data
              });
              return;
            })
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

async function getUnitDataForServer(server = 'gl') {
  const elements = ['fire', 'water', 'earth', 'thunder', 'light', 'dark'];
  const data = {
    info: {
      file: 'info.json',
      data: {}
    },
    evo_list: {
      file: 'evo_list.json',
      data: {}
    },
    feskills: {
      file: 'feskills.json',
      data: {}
    },
  };

  logger.info(`${server}: setting git data`);
  let fileInfo = ghData[data.info.file];
  if (server !== 'gl') {
    fileInfo = ghData[server].contents[data.info.file];
  }
  updateData.units[server] = fileInfo.date;

  if (statsOnly) {
    return {};
  }

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
    const [name, extension] = r.url.split('.');
    data[name].data = r.data;
  });

  logger.debug('info', Object.keys(data.info.data));

  // merge data together
  logger.info(`${server}: merging files`);
  const [info, evo_list, feskills] = [data.info.data, data.evo_list.data, data.feskills.data];

  Object.keys(evo_list).forEach(id => {
    const entry = evo_list[id];
    const curUnit = info[id],
      nextUnit = info[entry.evo.id.toString()];

    if (!curUnit) {
      logger.warn(`Can't add evo data to current unit ${id} as entry is missing`);
      return;
    } else if (!nextUnit) {
      logger.warn(`Can't add evo data to next unit ${entry.evo.id} as entry is missing`);
      return;
    }

    curUnit.evo_mats = entry.mats;
    curUnit.next = nextUnit.id.toString();
    nextUnit.prev = curUnit.id.toString();
  });

  Object.keys(feskills).forEach(id => {
    const entry = feskills[id];
    const unit = info[id];
    if (!unit) {
      logger.warn(`Can't add SP data to unit ${id} as entry is missing`);
      return;
    }
    unit.feskills = entry.skills;
  });

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
    logger.info(`${server}: saved ${filename}`);
  });
  return info;
}

async function getBurstDataForServer(server = 'gl', unitData = {}) {
  logger.info(`${server}: setting git data`);
  let fileInfo = ((ghData[server] ? ghData[server].contents : undefined) || ghData)['bbs_0.json']

  if (server === 'eu') {
    fileInfo = ghData[server].contents['bbs.json'];
  }
  updateData.bursts[server] = fileInfo.date;
  if (statsOnly) {
    return {};
  }


  let bbData = {};
  logger.info(`${server}: getting files`);
  if (server === 'eu') {
    const downloadResult = await downloadMultipleFiles([getUrl(server, 'bbs.json')]);
    bbData = downloadResult.map(r => {
        if (typeof r.data === "string") {
          r.data = JSON.parse(r.data);
        }
        return r;
      })[0].data;
  } else {
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
      const { data } = r;
      Object.keys(data)
        .forEach(key => {
          bbData[key] = data[key];
        })
    });
  }
  logger.debug('bbData', Object.keys(bbData));

  logger.info(`${server}: setting unit associations`);
  const burstTypes = ['bb', 'sbb', 'ubb'];
  Object.values(unitData)
    .forEach(unit => {
      burstTypes.forEach(type => {
        if (unit[type]) {
          const burstId = unit[type].id;
          if (bbData[burstId]) {
            if (!bbData[burstId].associated_units) {
              bbData[burstId].associated_units = [];
            }
            bbData[burstId].associated_units.push(unit.id.toString());
          } else {
            logger.warn(`No burst ID ${burstId} found in data from unit ${type} ${unit.id} (${unit.name})`);
          }
        }
      })
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
    logger.info(`${server}: saved ${filename}`);
  }
  
  return bbData;
}

async function getExtraSkillDataForServer(server = 'gl', unitData = {}) {
  logger.info(`${server}: setting git data`);
  let fileInfo = ghData['es.json'];
  if (server !== 'gl') {
    fileInfo = ghData[server].contents['es.json'];
  }
  updateData.extraSkills[server] = fileInfo.date;
  if (statsOnly) {
    return {};
  }


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
      })
  });
  logger.debug('esData', Object.keys(esData));

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
          logger.warn(`No ES ID ${esId} found in data from unit ${unit.id} (${unit.name})`);
        }
      }
    });
  logger.info(`${server}: saving files`);
  const filename = `es-${server}.json`;
  fs.writeFileSync(`${outputFolder}/${filename}`, JSON.stringify(esData, null, 2), 'utf8');
  logger.info(`${server}: saved ${filename}`);
  return esData;
}

async function getItemDataForServer(server = 'gl') {
  logger.info(`${server}: setting git data`);
  let fileInfo = ghData['items.json'];
  if (server !== 'gl') {
    fileInfo = ghData[server].contents['items.json'];
  }
  updateData.items[server] = fileInfo.date;
  if (statsOnly) {
    return {};
  }


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
      })
  });
  logger.debug('itemData', Object.keys(itemData));

  logger.info(`${server}: setting recipe names`);
  Object.values(itemData)
    .forEach(item => {
      if (item.recipe) {
        for (const mat of item.recipe.materials) {
          if (!itemData[mat.id]) {
            logger.warn(`no entry found for item ${mat.id} in recipe of ${item.id}`);
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
                  name: otherItem.name
                });
              }
            }
          }
        });
    });

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
    logger.info(`${server}: saved ${filename}`);
  }

  return itemData;
}

async function getLeaderSkillDataForServer(server = 'gl', unitData = {}) {
  logger.info(`${server}: setting git data`);
  let fileInfo = ghData['ls.json'];
  if (server !== 'gl') {
    fileInfo = ghData[server].contents['ls.json'];
  }
  updateData.leaderSkills[server] = fileInfo.date;
  if (statsOnly) {
    return {};
  }


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
      })
  });
  logger.debug('lsData', Object.keys(lsData));

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
          logger.warn(`No LS ID ${lsId} found in data from unit ${unit.id} (${unit.name})`);
        }
      }
    });
  logger.info(`${server}: saving files`);
  const filename = `ls-${server}.json`;
  fs.writeFileSync(`${outputFolder}/${filename}`, JSON.stringify(lsData, null, 2), 'utf8');
  logger.info(`${server}: saved ${filename}`);
  return lsData;
}

// TODO: implement usage for this
async function getDictionaryForServer(server = 'gl') {
  logger.info(`${server}: getting files`);
  let dictionaryData = {};
  const downloadResult = await downloadMultipleFiles([getUrl(server, 'dictionary.json')]);
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
      })
  });
  logger.debug('dictionaryData', Object.keys(dictionaryData));
  return dictionaryData;
}

async function getData(servers = ['gl', 'eu', 'jp']) {
  if (statsOnly) {
    logger.info('Getting GH stats only');
  }
  await initializeGHData();
  // TODO: implement use of dictionary data
  for (const s of servers) {
    const unitData = await getUnitDataForServer(s);
    await getBurstDataForServer(s, unitData);
    await getExtraSkillDataForServer(s, unitData);
    await getLeaderSkillDataForServer(s, unitData);
    await getItemDataForServer(s);
  }

  logger.info(`saving update statistics file`);
  const filename = `update-stats.json`;
  fs.writeFileSync(`${outputFolder}/${filename}`, JSON.stringify(updateData, null, 2), 'utf8');
  logger.info(`saved ${filename}`);
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

// statsOnly = true;
// getUnitData();
getData();
// initializeGHData();
