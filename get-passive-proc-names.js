const GoogleSheetScraper = require('./gs-scraper');
const fs = require('fs');
const PUBLIC_SPREADSHEET_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQq5h9NWuJ-1N--XE1Opd3f-0RrvSIxkANGuv05HdfV4FiRAi65mvdY7E9MwV08GwGeV_xLfxMVnNoe/pubhtml#';

function addTableDataToMapping (tableData = [], mapping = {}, columnKeyName) {
  tableData.forEach(entry => {
    mapping[entry[columnKeyName]] = entry;
  });
}

async function main () {
  const scraper = new GoogleSheetScraper();
  const sheetData = await scraper.getContents(PUBLIC_SPREADSHEET_URL);
  await scraper.close();

  const mapping = {
    passive: {},
    proc: {},
  };
  const passiveTable = sheetData[Object.keys(sheetData).find(k => k.startsWith('Passive'))];
  addTableDataToMapping(passiveTable, mapping.passive, 'ID');

  const procTable = sheetData[Object.keys(sheetData).find(k => k.startsWith('Proc'))];
  addTableDataToMapping(procTable, mapping.proc, 'ID');

  fs.writeFileSync('src/assets/buff-translation/passive-proc-metadata.json', JSON.stringify(mapping, null, 2), 'utf8');
}

main();
