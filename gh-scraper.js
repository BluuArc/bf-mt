const puppeteer = require('puppeteer');
const CliLogger = require('./cli-logger');

const logger = new CliLogger('GH-SCRAPER');

const instances = {
  browser: null,
  page: null,
};

async function getBrowserInstance() {
  if (!instances.browser) {
    instances.browser = await puppeteer.launch(/* { headless: false } */);
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

class GitHubScraper {
  async getFileTree (url) {
    logger.log('fetching filetree for', url);
    const page = await getPageInstance(url);
    const fileTree = {};
    const pageResult = await page.evaluate(() => {
      return new Promise((fulfill, reject) => {
        const onReady  = () => {
          if (document.readyState === 'complete') {
            const result = Array.from(document.querySelectorAll('tr.js-navigation-item')).map(elem => ({
              name: (elem.querySelector('.content a') || {}).title,
              date: elem.querySelector('.age time-ago') ? elem.querySelector('.age time-ago').attributes.datetime.value : undefined,
              link: (elem.querySelector('.content a') || {}).href,
              isFolder: elem.querySelector('.icon > svg.octicon') && elem.querySelector('.icon > svg.octicon').classList.contains('octicon-file-directory'),
            })).filter(elem => !!elem.name);
            fulfill(result);
          }
        };
        if (document.readyState === 'complete') {
          waitForDatesToLoad(onReady);
          // onReady();
        } else {
          document.onreadystatechange = () => waitForDatesToLoad(onReady);
        }

        function waitForDatesToLoad (callback) {
          const hasUnresolvedDates = Array.from(document.querySelectorAll('tr.js-navigation-item'))
            .map(elem => ({
              name: (elem.querySelector('.content a') || {}).title,
              date: elem.querySelector('.age time-ago') ? elem.querySelector('.age time-ago').attributes.datetime.value : undefined,
            })).filter(elem => !!elem.name)
            .some(elem => !elem.date);
          if (hasUnresolvedDates) {
            // eslint-disable-next-line no-console
            console.log('Waiting for dates to load');
            requestAnimationFrame(() => waitForDatesToLoad(callback));
          } else {
            callback();
          }
        }
      });
    });
    // logger.log(pageResult);
    for (const entry of pageResult) {
      // logger.log(entry);
      const { name, date, link, isFolder } = entry;
      fileTree[name] = { name, date, link, isFolder };
      if (isFolder) {
        const tempResult = await this.getFileTree(link.startsWith('http') ? link : `https://github.com${link}`);
        fileTree[name].contents = tempResult;
      }
    }
    logger.log('fetched filetree for', url).done();
    return fileTree;
  }

  async close () {
    const browser = await getBrowserInstance();
    await browser.close();
  }
}

module.exports = GitHubScraper;
