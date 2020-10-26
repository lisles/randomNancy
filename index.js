require('dotenv').config();

const { DateTime, Interval } = require('luxon');
const { Chance } = require('chance');
const { WebClient, ErrorCode } = require('@slack/web-api');
const Files = require('./files');

const token = process.env.BOT_TOKEN;
const web = new WebClient(token);
var chance= new Chance();

(async () => {
  // get window of posting from .env
  const postWindow = JSON.parse(process.env.POST_WINDOW_UTC)
  const dtNow = DateTime.utc().toISO();
  const dtStart = DateTime.fromFormat(postWindow.start, 'H:mm', {zone: 'utc'}).toISO();
  const dtEnd = DateTime.fromFormat(postWindow.end, 'H:mm', {zone: 'utc'}).toISO();
  const nHoursOpen = Interval.fromDateTimes(DateTime.fromISO(dtStart), DateTime.fromISO(dtEnd)).count('hours');
  
  // if we're between the start and end times from .env, run the script
  if (dtNow >= dtStart && dtNow <= dtEnd) {

    // roll the dice, false is as likely to be called as the number of hours
    // in the start/end window minus 1
    if (chance.weighted([false, true], [nHoursOpen-1, 1])) {

      // get random file from s3
      const randomFile = await Files.randomFile()
      console.log(randomFile)
      
      // get team info
      const team = await web.team.info();
      const teamID = team.id;

      // get users, randomNancy
      const users = await web.users.list({team_id: teamID});
      const randomNancyUser = users.members.filter( (user) => { 
        return user.name == 'randomnancy' 
      })
      const randomNancyID = randomNancyUser[0].id;

      // invite RandomNancy to all channels, see what's in em 
      const conversations = await web.conversations.list();  
      const channels = conversations.channels;
      // console.log(`Got ${channels.length} Channels`);
      
      let channelAggs = [];
      // loop through the channels
      for (channel of channels) {
        // console.log('---------------')
        // console.log(`${channel.id} [${channel.name}]`)    
        
        // randomNancy joins -- she must be in the channel to do history
        await web.conversations.join({channel: channel.id});

        // get all the messages for analysis
        const channelHistory = await web.conversations.history({channel: channel.id})
        // console.log(channelHistory.messages.length);
        let maxTS = Math.max.apply(Math, channelHistory.messages.map(function(o) { return o.ts; }))

        channelAggs.push({
          channelID: channel.id,
          maxTS: maxTS,
          numberMessages: channelHistory.messages.length});    
      }

      // console.log(channelAggs);
      const max = channelAggs.reduce(function(prev, current) {
        return (prev.maxTS > current.maxTS) ? prev : current
      }) //returns object
      // console.log(max)

      // post a message
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
      // console.log(postResponse);
    } else console.log('no chance')
  } else console.log('window closed')
})();

