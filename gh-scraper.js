const axios = require('axios');
const cheerio = require('cheerio');

class GitHubScraper {
  constructor (url) {
    this.url = url;
    this.$promise = this.getHtml().then(html => cheerio.load(html.data));
  }

  getHtml () {
    return axios.get(this.url);
  }

  async getFileTree () {
    const $ = await this.$promise;
    const rows = $('tr.js-navigation-item');
    const result = {};
    for (let i = 0; i < rows.length; ++i) {
      const currentRow = rows.eq(i);
      const name = currentRow.find('.content a').attr('title');
      const date = currentRow.find('.age time-ago').attr('datetime');
      const link = currentRow.find('.content a').attr('href');
      const isFolder = currentRow.find('.icon > svg.octicon').hasClass('octicon-file-directory');
      if (!name) {
        continue;
      }
      result[name] = { name, date, link, isFolder };

      if (isFolder) {
        const tempScraper = new GitHubScraper(`https://github.com${link}`);
        const tempResult = await tempScraper.getFileTree();
        result[name].contents = tempResult;
      }
    }
    return result;
  }
}

// const ghScraper = new GitHubScraper('https://github.com/cheahjs/bravefrontier_data');

// ghScraper.getFileTree()
//   .then(result => console.log('[RESULT]', result));

module.exports = GitHubScraper;
