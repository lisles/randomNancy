const { DateTime, Interval } = require('luxon');

const settings = require('./settings.json');
const { GoogleSpreadsheet } = require('google-spreadsheet');
const { getLogRows } = require('./db');

async function getPromptSheet() {  
  const doc = new GoogleSpreadsheet(settings.config.promptSheet);
  await doc.useServiceAccountAuth(require('./googleCredsLogging.json'));
  await doc.loadInfo();

  return doc.sheetsByIndex[0];
}  

async function getAllPromptRows() {
  const promptSheet = await getPromptSheet();
  const rows = await promptSheet.getRows();
  let data = [];

  for (i = 0; i < rows.length; i++) {
    const rowData = {'date': rows[i].date, 'content': rows[i].thing, 'user': rows[i].user}
    data.push(rowData);
  }

  return data
}

async function randomPrompt() {
  // send a randomly selected file
  const logs = await getLogRows();
  const allPrompts = await getAllPromptRows();  

  // return items that are less than 30 days ago. these should be filtered from aws files list
  const rawLog = logs.filter( (el) => {
    const dt = DateTime.fromISO(el.date).toUTC();
    return Interval.fromDateTimes(dt, DateTime.utc()).count('days')-1 < 31;
  });

  // make arrays of the two file obj sources
  const prompts = allPrompts.map( (obj) => {
    return obj.user + '|' + obj.content
  });
  const logContent = rawLog.map( (obj) => {
    return obj.content
  })

  // filter the files out of aws list where they are in the logs list
  let filteredPrompts = prompts.filter( (el) => {
    return !logContent.includes(el)
  });

  // return a random file from the filtered set
  return filteredPrompts[ Math.floor(Math.random() * filteredPrompts.length) ]
}

module.exports.randomPrompt = randomPrompt;