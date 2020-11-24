const { DateTime, Interval } = require('luxon');
const { WebClient, ErrorCode } = require('@slack/web-api');

const settings = require('./settings.json');
const { Chance } = require('chance');
const Files = require('./files');
const { randomPrompt } = require('./prompts')
const { postContentLog } = require('./db');

const token = settings.config.botToken;
const web = new WebClient(token);
var chance = new Chance();


function logging(msg) {
  process.stdout.write(`[${DateTime.utc().toISO()}]::${msg}\n`);
}

(async () => {
  const debug = settings.config.debug
  if (debug) {console.log('***debug****')};

  const postWindow = settings.config.post.postWindowUTC;
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
      // prep a timeout so we can vary the actual post time      
      var randomStartMS = 0
      if (settings.config.post.randomizePostTime === true && debug === false) {
        console.log('randomizing start time');
        let minMin = 120000 // 5 mins
        let maxMin = 900000 // 15
        randomStartMS = Math.floor( Math.random() * (maxMin - minMin) + minMin );
      };

      setTimeout( async function () {
        // get random file from s3
        if (settings.config.promptSheet) {
          console.log('getting content');
          var content = await randomPrompt();
          console.log(content);
          const splitContent = content.split('|');
          var promptContent = splitContent[1];
        } else {
          var randomFile = await Files.randomFile()
        }

        console.log(randomFile || promptContent);
        logging(`file: ${randomFile || promptContent }`);
        
        // get team info
        const team = await web.team.info();
        const teamID = team.id;

        // get users, randomNancy
        const users = await web.users.list({team_id: teamID});
        const randomNancyUser = users.members.filter( (user) => { 
          return user.name == 'randomNancy' 
        })

        // invite RandomNancy to all channels, see what's in em 
        const conversations = await web.conversations.list();  
        const channels = conversations.channels;
        
        // loop through the channels
        let channelAggs = [];
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

          } catch (e) {
            logging(e)
          }
        }

        const max = channelAggs.reduce( function(prev, current) {
          return (prev.maxTS > current.maxTS) ? prev : current
        }) //returns object (channel with most recent activity)

        // post a message
        if (!debug) {
          if (randomFile) {
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
          else {
            try {
              const postResponse = await web.chat.postMessage({
                "channel": max.channelID,
                "blocks": [
                  {
                    "type": "section",
                    "text": {
                      "type": "mrkdwn",
                      "text": promptContent
                    },
                  }
                ]
              })
              logging(JSON.stringify(postResponse));            
            } catch (error) {
              logging(error);
            }

          }
        }
        else {logging('would have posted, but debugging')}

        // log to the db date and file we just posted
        console.log(randomFile);
        if (!randomFile === undefined) {
          postContentLog([DateTime.utc().toISO(), randomFile]);
        } else {
          console.log('logging');
          postContentLog([DateTime.utc().toISO(), content]);
        }

      }, randomStartMS); // end setTimeOut

    } else logging('no chance')

  } else logging('window closed')

})();

