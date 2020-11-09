const settings = require('./settings.json');

const { DateTime, Interval } = require('luxon');
const { Chance } = require('chance');
const { WebClient, ErrorCode } = require('@slack/web-api');
const Files = require('./files');

const token = settings.config.botToken;
const web = new WebClient(token);
var chance = new Chance();


function logging(msg) {
  console.log(msg);
  process.stdout.write(`[${DateTime.utc().toISO()}]::${msg}\n`);
}

(async () => {
  if (settings.config.debug) {console.log('***debug****')};

  const postWindow = settings.config.postWindowUTC;
  const dtNow = DateTime.utc().toISO();
  const dtStart = DateTime.fromFormat(postWindow.start, 'H:mm', {zone: 'utc'}).toISO();
  const dtEnd = DateTime.fromFormat(postWindow.end, 'H:mm', {zone: 'utc'}).toISO();
  const nHoursOpen = Interval.fromDateTimes(DateTime.fromISO(dtStart), DateTime.fromISO(dtEnd)).count('hours');
  
  // if we're between the start and end times, go forth
  if (dtNow >= dtStart && dtNow <= dtEnd) {

    // roll the dice, false is as likely to be called as the number of hours
    // in the start/end window minus 1
    const shouldPost = chance.weighted([false, true], [nHoursOpen/2, 1])
    if (shouldPost) {

      // get random file from s3
      const randomFile = await Files.randomFile()
      logging(`file: ${randomFile}`);
      
      // get team info
      const team = await web.team.info();
      const teamID = team.id;

      // get users, randomNancy
      const users = await web.users.list({team_id: teamID});
      const randomNancyUser = users.members.filter( (user) => { 
        return user.name == 'randomnancy' 
      })

      // invite RandomNancy to all channels, see what's in em 
      const conversations = await web.conversations.list();  
      const channels = conversations.channels;
      
      let channelAggs = [];
      // loop through the channels
      for (channel of channels) {      

        // randomNancy joins -- she must be in the channel to do history
        try {
          await web.conversations.join({channel: channel.id});

          // get all the messages for analysis
          const channelHistory = await web.conversations.history({channel: channel.id})
          let maxTS = Math.max.apply(Math, channelHistory.messages.map(function(o) { return o.ts; }))

          channelAggs.push({
            channelID: channel.id,
            maxTS: maxTS,
            numberMessages: channelHistory.messages.length});    

        } catch (joinError) {
          logging(joinError)
        }
      }

      const max = channelAggs.reduce( function(prev, current) {
        return (prev.maxTS > current.maxTS) ? prev : current
      }) //returns object

      // post a message
      if (!settings.config.debug) {
        try {
          const postResponse = await web.chat.postMessage({
            "channel": max.channelID,
            "blocks": [
              {
                "type": "image",
                "image_url": randomFile,
                "alt_text": "randomNancy Image"
              }
            ]
          })
          logging(JSON.stringify(postResponse));
        } catch (error) {
          logging(error);
        }
      }
      else {logging('would have posted, but debugging')}

    } else logging('no chance')

  } else logging('window closed')

})();

