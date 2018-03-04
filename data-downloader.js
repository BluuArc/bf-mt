const fs = require('fs');
const rp = require('request-promise');
const logger = require('winston');
logger.level = 'debug';

const outputFolder = 'static/bf-data';

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

async function getUnitData(servers = ['gl', 'eu', 'jp']) {
  const elements = ['fire', 'water', 'earth', 'thunder', 'light', 'dark'];

  servers.forEach(async (server) => {
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
        }else if (!nextUnit) {
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
        .forEach(id => { fileData[id] = info[id]; });

      logger.debug(`fileData ${element}`, Object.keys(fileData).length);
      const filename = `units-${server}-${index+1}.json`;
      fs.writeFileSync(`${outputFolder}/${filename}`, JSON.stringify(fileData, null, 2), 'utf8');
      logger.info(`${server}: saved ${filename}`);
    })
  });



}

getUnitData(['gl']);
