const settings = require('./settings.json');
const { GoogleSpreadsheet } = require('google-spreadsheet');

async function getLogSheet() {  
  const doc = new GoogleSpreadsheet(settings.config.logSheet);
  await doc.useServiceAccountAuth(require('./googleCredsLogging.json'));
  await doc.loadInfo();
  
  try {
    logSheet = await doc.addSheet(
      { 
        title: settings.instance,
        headerValues: ['date', 'content']
      }
    );
  } catch (e) {
    logSheet = doc.sheetsByTitle[settings.instance];
  }

  return logSheet
}

async function postContentLog(logValue) {
  const logSheet = await getLogSheet();      
  await logSheet.addRow(logValue);
}

async function getLogRows() {
  const logSheet = await getLogSheet();
  const rows = await logSheet.getRows();
  let data = [];

  for (i = 0; i < rows.length; i++) {
    const rowData = {'date': rows[i].date, 'content': rows[i].content}
    data.push(rowData);
  }

  return data
}

module.exports.postContentLog = postContentLog;
module.exports.getLogRows = getLogRows;

