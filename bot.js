 
const Botkit  = require('botkit');
const request   = require('superagent');


if(!process.env.token){
  console.log("errr");
  process.exit(1);

}


const controller = Botkit.slackbot();


controller.spawn({
  token:process.env.token
}).startRTM();



//receive messages


controller.on('channel_joined', (bot, message)=>{
  console.log(`${bot.identity.name} was invited to channel ${message.channel.name}`);
  bot.say({
      text:`Thank you for inviting me to the channel ${message.channel.name}`,
      channel:message.channel.id
  });
}
);

controller.on(['direct_message', 'direct_mention', 'mention', 'ambient', 'message_changed'], (bot,message)=>
        bot.reply(message, "I am a bot, you are wasting your time.")
);

controller.hears(['[0-9]+'],['direct_message', 'direct_mention','mention','ambient'],(bot, message)=>{
  const number  = message.match[0];
  request
    .get(`http://numbersapi.com/${number}`)
    .end((err, res)=>{
      if(!err){
        bot.reply(message, res.text);
      }
    })
    }

);


//Conversations


controller.hears(['trivia'],['direct_message','direct_mention','mention'] , (bot,message)=>{
    bot.startConversation(message,(err,convo)=>{
        const askParameter = (response, convoAskParameter, text) => {
          convoAskParameter.ask(text, (response, convoAsk)=>{
            convoAsk.say('All right, let me see...');
            convoAsk.next();
          },
          {
            key:'number'
          });
        }
        convo.ask('what kind of trivia do you want? GENRAL, MATH, or DATE',
        [{
          pattern:'general',
          callback:(response, convoCallback) =>{
            askParameter(response, convoCallback, 'Greate, give me either a number or the keyboard random');
            convoCallback.next();
          }
        },
        {
          pattern:'math',
          callback:(response, convoCallback) =>{
            askParameter(response, convoCallback, 'Greate, give me either a number or the keyboard random');
            convoCallback.next();
          }
        },
        {
          pattern:'date',
          callback:(response, convoCallback) =>{
            askParameter(response, convoCallback, 'Greate, give me either a number or the keyboard random or a date of year in the form month/day ');
            convoCallback.next();
          }
        },
        {
          pattern:'default',
          callback:(response, convoCallback) =>{
            convoCallback.repeat();
            convoCallback.next();
          }
        }
      ],{key:'type'}
    );
    convo.on('end', convoEnd => {
      if(convoEnd.status == 'completed'){
        const type = convoEnd.extractResponse('type').toLowerCase() !== 'general'
                      ? convoEnd.extractResponse('type').toLowerCase()
                      : '';
        const number = convoEnd.extractResponse('number').toLowerCase();

        request
              .get(`http://numbersapi.com/${number}/${type}`)
              .end((err, res) => {
                if(err){
                  bot.reply(message, 'Sorry,  I couldn\'t print process your request');
                }else{
                  bot.reply(message, res.text);
                }
              });
      }
    })

    })
});
