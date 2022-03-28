const { Client, Collection, Intents } = require("discord.js");
const fetch = require("node-fetch");
const { MessageEmbed } = require("discord.js");
const Twit = require("node-tweet-stream");
const fs = require("fs");
const decodeN = require('html-entities')

const config = JSON.parse(fs.readFileSync("./config.json", "utf8"));

// https://github.com/otherwisee/DiscordTwitterBot thanks for twitter guide

const client = new Client({ intents: ["GUILDS", "GUILD_MESSAGES"] });

const rhcpURL = "https://www.reddit.com/r/redhotchilipeppers/new.json?t=hour";
rhcp_subreddit_channel_ID = "957791328752775239";

//twitter client ---------------------------------------
const t = new Twit({
  consumer_key: config.twitterConsumerKey,
  consumer_secret: config.twitterConsumerSecret,
  //app_only_auth:true,
  //access_token_key:config.twitterAccessTokenKey,
  //access_token_secret:config.twitterAccessTokenSecret
  token: config.twitterAccessTokenKey,
  token_secret: config.twitterAccessTokenSecret,
});

// Tweet Listener + Post
t.on("tweet", function (tweet) {
	if(isReply(tweet) === true){
		pass 
	} else {
		let media = tweet.entities.media;
		let tweetURL = `https://twitter.com/${tweet.user.screen_name}/status/${tweet.id_str}`
		chatPost(
		  tweet.text,
		  tweet.user.name,
		  tweet.user.screen_name,
		  tweetURL,
		  tweet.user.profile_image_url,
		  media
		)
	}})
 
t.on("error", function (err) {
  console.log("Oh no");
});
let track = config.following;
for (var i = 0; i < track.length; i++) {
  t.follow(track[i]);
  console.log(`Following Twitter User [ID]${track[i]}`);
}

// twitter function
function isReply(tweet) {
	if (tweet.retweeted_status
	  || tweet.in_reply_to_status_id
	  || tweet.in_reply_to_status_id_str
	  || tweet.in_reply_to_user_id
	  || tweet.in_reply_to_user_id_str
	  || tweet.in_reply_to_screen_name) return true;
	return false;
  }

function chatPost(content, author, atAuthor, tweetURL, authorPfp, media) {
	const authorTweet = author+' @'+atAuthor;
  const message = new MessageEmbed()
    .setColor("#00acee")
    .setDescription(content)
    .setTimestamp()
    .setAuthor({
      name: authorTweet,
      iconURL: authorPfp,
      url: tweetURL,
    })
    .setURL(tweetURL)
    .setFooter({
      text: "Twitter",
      iconURL:
        "https://camo.githubusercontent.com/3253f1e385efa0b09493d467f352e10414c3984064c6a4e99d4e705709018c43/68747470733a2f2f66696c6970706f62697374616666612e6769746875622e696f2f696d616765732f747769747465722e737667",
    });

  if (!!media)
    for (var j = 0; j < media.length; j++) message.setImage(media[j].media_url);

  for (const __channel of config.channelsToPost.map((x) =>
    client.channels.cache.get(x)
  ))
    __channel.send({ embeds: [message] });
}

// -------------------------------

client.commands = new Collection();
const commandFiles = fs
  .readdirSync("./commands")
  .filter((file) => file.endsWith(".js"));

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  // Set a new item in the Collection
  // With the key as the command name and the value as the exported module
  client.commands.set(command.data.name, command);
}

client.once("ready", () => {
  console.log("Flea is ready!");
});

// client.on("messageCreate", (message) => {
//   if (message.content == "ping") {
//     message.reply("pong");
//   }
// });

//fetch reddit posts via cron every minute
var cron = require("node-cron");
const pass = require("./commands/pass");

cron.schedule("* * * * *", () => {
  let postsDate = [];

  fetch(rhcpURL)
    .then((response) => response.json())
    .then((postsJSON) => {
      const subredditDate = Math.floor(Date.now() / 1000);

      for (var i = 0; i < postsJSON["data"]["children"].length; i++) {
        const utc_post =
          postsJSON["data"]["children"][i]["data"]["created_utc"];
        seconds_since = subredditDate - utc_post;
        postsDate.push(seconds_since);
      }

      // returns list with indexes of new posts last minute
      const postsIndexes = postsDate.reduce(function (arr, e, i) {
        if (e <= 61) arr.push(i);
        return arr;
      }, []);

      let lastMinutePosts = [];

      postsIndexes.forEach((i) => {
        dictionary_to_push = {
          title: decodeN.decode(postsJSON["data"]["children"][i]["data"]["title"].substring(
            0,
            255
          )),
          reddit_url:
            "https://www.reddit.com/" +
            postsJSON["data"]["children"][i]["data"]["permalink"],
          media_url: postsJSON["data"]["children"][i]["data"]["url"],
          user: postsJSON["data"]["children"][i]["data"]["author"],
          self: decodeN.decode(postsJSON["data"]["children"][i]["data"]["selftext"].substring(
            0,
            4000
          )),
        };

        // replaces cases where self posts is just preview link broken
        if (dictionary_to_push.self.startsWith("&amp")) {
          dictionary_to_push.media_url = Object.values(
            postsJSON["data"]["children"][0]["data"]["media_metadata"]
          )[0]["p"][0]["u"].replace("preview", "i");
          dictionary_to_push.self = "";
        }

        lastMinutePosts.push(dictionary_to_push);
      });

      const channel = client.channels.cache.get(rhcp_subreddit_channel_ID);

      lastMinutePosts.forEach((post) => {
        const subredditEmbed = new MessageEmbed()
          .setColor("#ff0019")
          .setTitle(post.title)
          .setDescription(post.self)
          .setTimestamp()
          .setThumbnail(
            post.media_url
          )
          .setURL(post.reddit_url)
          .setFooter({
            text: "/u/" + post.user,
            iconURL:
              "https://github.com/og-brandon/fleabot/blob/master/images/snoo.png?raw=true",
          });

		  if(post.self || (!post.self && !post.media_url)){
			  subredditEmbed.setThumbnail('https://github.com/og-brandon/fleabot/blob/master/images/snoo.png?raw=true')
		  }

        channel.send({ embeds: [subredditEmbed] });
      });
    });
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isCommand()) return;

  const command = client.commands.get(interaction.commandName);

  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    await interaction.reply({
      content: "There was an error while executing this command!",
      ephemeral: true,
    });
  }
});

client.login(config.token);

// const redditFetch = require('reddit-fetch');

// redditFetch({

//     subreddit: 'all',
//     sort: 'hot',
//     allowNSFW: true,
//     allowModPost: true,
//     allowCrossPost: true,
//     allowVideo: true

// }).then(post => {
//     console.table(post);
// });
