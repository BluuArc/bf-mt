const puppeteer = require('puppeteer');

const instances = {
  browser: null,
  page: null,
};

async function getBrowserInstance() {
  if (!instances.browser) {
    instances.browser = await puppeteer.launch();
  }

  return instances.browser;
}

async function getPageInstance(url) {
  const browser = await getBrowserInstance();
  if (!instances.page) {
    instances.page = await browser.newPage();
  }

  if (url) {
    await instances.page.goto(url);
  }

  return instances.page;
}

class GitHubScraper {
  async getFileTree (url) {
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
              isFolder: elem.querySelector('.icon > svg.octicon') && elem.querySelector('.icon > svg.octicon').classList.contains('octicon-file-directory')
            })).filter(elem => !!elem.name);
            fulfill(result);
          }
        };
        if (document.readyState === 'complete') {
          onReady();
        } else {
          document.onreadystatechange = onReady;
        }
      });
    });
    // console.log(pageResult);
    for (const entry of pageResult) {
      // console.log(entry);
      const { name, date, link, isFolder } = entry;
      fileTree[name] = { name, date, link, isFolder };
      if (isFolder) {
        const tempResult = await this.getFileTree(link.startsWith('http') ? link : `https://github.com${link}`);
        fileTree[name].contents = tempResult;
      }
    }
    return fileTree;
  }

  async close () {
    const browser = await getBrowserInstance();
    await browser.close();
  }
}

module.exports = GitHubScraper;
