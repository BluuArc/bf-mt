// based off of https://github.com/Asmor/gs-loader
const puppeteer = require('puppeteer');
const CliLogger = require('./cli-logger');

const logger = new CliLogger('GS-SCRAPER');

const instances = {
  browser: null,
  page: null,
};

async function getBrowserInstance() {
  if (!instances.browser) {
    instances.browser = await puppeteer.launch({ headless: true });
  }

  return instances.browser;
}

async function getPageInstance(url) {
  const browser = await getBrowserInstance();
  if (!instances.page) {
    instances.page = await browser.newPage();
  }

  if (url) {
    await instances.page.goto(url, { timeout: 60 * 1000 });
  }

  return instances.page;
}

class GoogleSheetScraper {
  async getContents (publicHtmlUrl) {
    logger.log('fetching contents for', publicHtmlUrl);
    const page = await getPageInstance(publicHtmlUrl);
    const pageResult = await page.evaluate(() => {
      return new Promise((fulfill) => {
        const onReady = () => {
          const sheets = Array.from(document.querySelectorAll('ul#sheet-menu li')).map(listElem => {
            return {
              name: listElem.innerText,
              id: listElem.id.split('button-')[1], // sheet-button-<sheet-id>
            };
          });
          const sheetMapping = {};
          sheets.forEach(sheet => {
            // assumption: one table per sheet
            const rows = [];
            const sheetTable = document.getElementById(sheet.id);
            const [headerRow, ...tableRows] = Array.from(sheetTable.querySelectorAll('tbody tr'));

            const columnMapping = Array.from(headerRow.querySelectorAll('td'))
              .map((elem, i) => elem.innerText.trim() || `col-${i}`);
            const createRowDataObject = (row) => {
              const dataCells = Array.from(row.querySelectorAll('td')).map(e => e.innerText.trim());
              return columnMapping.reduce((acc, columnName, index) => {
                acc[columnName] = dataCells[index];
                return acc;
              }, {});
            };

            tableRows.forEach(row => {
              rows.push(createRowDataObject(row));
            });

            sheetMapping[`${sheet.name}|${sheet.id}`] = rows;
          });
          fulfill(sheetMapping);
        };
        if (document.readyState === 'complete') {
          onReady();
        } else {
          document.onreadystatechange = () => onReady();
        }
      });
    });
    logger.log('fetched contents for', publicHtmlUrl).done();
    return pageResult;
  }
  async close () {
    const browser = await getBrowserInstance();
    await browser.close();
  }

  static async test () {
    const scraper = new GoogleSheetScraper();
    const data = await scraper.getContents('https://docs.google.com/spreadsheets/d/e/2PACX-1vQq5h9NWuJ-1N--XE1Opd3f-0RrvSIxkANGuv05HdfV4FiRAi65mvdY7E9MwV08GwGeV_xLfxMVnNoe/pubhtml');
    await scraper.close();
    return data;
  }
}

module.exports = GoogleSheetScraper;
