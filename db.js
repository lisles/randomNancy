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

  const rows = await logSheet.getRows();
}

module.exports.postContentLog = postContentLog;

//   // console.log(`sheet: ${logSheet.title}`);
//   // // console.log(logSheet.cellStats);
//   // // let cells = await logSheet.loadCells('A1');
//   // await logSheet.loadCells('A1:E10'); 
//   // const a1 = logSheet.getCellByA1('A1'); 
//   // const b1 = logSheet.getCellByA1('B1')
//   // console.log(a1.value,b1.value);

//   // reading/writing
// for (i = 0; i < rows.length; i++) {
//   console.log(rows[i].date,rows[i].content);
// }

