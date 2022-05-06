const { Client, Collection, Intents } = require("discord.js");
const fetch = require("node-fetch");
const { MessageEmbed } = require("discord.js");
const Twit = require("node-tweet-stream");
const fs = require("fs");
const decodeN = require("html-entities");

const config = JSON.parse(fs.readFileSync("./config.json", "utf8"));

// https://github.com/otherwisee/DiscordTwitterBot thanks for twitter guide

const client = new Client({ intents: ["GUILDS", "GUILD_MESSAGES"] });

const rhcpURL = "https://www.reddit.com/r/RedHotChiliPeppers/new.json?t=hour";

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
if (config.rhcp_twitter_toggle) {
  t.on("tweet", function (tweet) {
    if (isReply(tweet) === true) {
      //
    } else {
      let media = tweet.entities.media;
      let tweetURL = `https://twitter.com/${tweet.user.screen_name}/status/${tweet.id_str}`;
      chatPost(
        tweet.text,
        tweet.user.name,
        tweet.user.screen_name,
        tweetURL,
        tweet.user.profile_image_url,
        media
      );
    }
  });

  t.on("error", function (err) {
    logger.error(err);
  });
  let track = config.following;
  for (var i = 0; i < track.length; i++) {
    t.follow(track[i]);
    logger.info(`Following Twitter User [ID]${track[i]}`);
  }

  // twitter function
  function isReply(tweet) {
    return !!(
      tweet.retweeted_status ||
      tweet.in_reply_to_status_id ||
      tweet.in_reply_to_status_id_str ||
      tweet.in_reply_to_user_id ||
      tweet.in_reply_to_user_id_str ||
      tweet.in_reply_to_screen_name
    );
  }

  function chatPost(content, author, atAuthor, tweetURL, authorPfp, media) {
    const authorTweet = author + " @" + atAuthor;
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
          "https://raw.githubusercontent.com/og-brandon/fleabot/master/images/twitter.png",
      });

    if (!!media)
      for (let j = 0; j < media.length; j++)
        message.setImage(media[j].media_url);

    for (const __channel of config.twitter_channel.map((x) =>
      client.channels.cache.get(x)
    ))
      __channel.send({ embeds: [message] });
  }
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
  logger.info("Flea is ready!");
});

// client.on("messageCreate", (message) => {
// 	if (message.content == "ping") {
// 	  message.reply("pong");
// 	}
//   });

function cToF(celsius) {
  const cTemp = celsius;
  const cToFahr = (cTemp * 9) / 5 + 32;
  return cTemp + "\xB0C is " + cToFahr + " \xB0F.";
}

function fToC(fahrenheit) {
  const fTemp = fahrenheit;
  const fToCel = ((fTemp - 32) * 5) / 9;
  return fTemp + "\xB0F is " + fToCel + "\xB0C.";
}

const prefix = ".";

const waitTime = 15;
const waitTimeBot = waitTime * 1000;
const waitTimeText = `Guess in ${waitTime} seconds!`;

const lyricstrivia = require("./lyricstrivia");
const { logger } = require("./logger");
client.on("messageCreate", (message) => {
  if (!message.content.startsWith(prefix) || message.author.bot) return;

  let args = message.content.slice(prefix.length).trim().split(" ");
  const command = args.shift().toLowerCase();
  const messageArguments = args.join(" ");

  if (command === "lyricstrivia") {
    message.channel.sendTyping();
    const embedColor = "#" + Math.floor(Math.random() * 16777215).toString(16);
    try {
      lyricstrivia
        .getRandomSongSectionByArtist(messageArguments)
        .then((songObject) => {
          if (!songObject) {
            message.channel.send(
              "An error happened 😬 Please try again, it might work."
            );
            return;
          }

          try {
            const songEmbed = new MessageEmbed()
              .setColor(embedColor)
              .setTitle("Guess this song from " + songObject.artist)
              .setDescription(songObject.section)
              .setTimestamp()
              .setThumbnail(
                "https://ichef.bbci.co.uk/news/976/cpsprodpb/13F53/production/_83874718_thinkstockphotos-104548222.jpg"
              )
              .setFooter({
                text: "💿 " + waitTimeText,
              });

            const songSecondEmbed = new MessageEmbed()
              .setColor(embedColor)
              .setTitle(songObject.title)
              .setDescription(songObject.title)
              .setTimestamp()
              .setImage(songObject.art)
              .setURL(songObject.url)
              .setFooter({
                text: "💿 - " + songObject.artist,
              });
            message.channel.send({ embeds: [songEmbed] });
            setTimeout(() => {
              message.channel.send({
                embeds: [songSecondEmbed],
              });
            }, waitTimeBot);
          } catch (error) {
            const songSecondEmbed = new MessageEmbed()
              .setColor(embedColor)
              .setDescription("An error happened 😬")
              .setTimestamp();

            message.channel.send({ embeds: [songSecondEmbed] });
          }
        });
    } catch (error) {
      logger.error(error);
      message.channel.send(
        "An error happened 😬 Please try again, it might work."
      );
    }
  }

  if (command === "converttocelsius") {
    if (messageArguments === "") {
      message.channel.send("Put a number dummy");
    } else {
      const temperature = parseInt(messageArguments);
      message.channel.send(fToC(temperature));
    }
  }

  if (command === "converttofahrenheit") {
    if (messageArguments === "") {
      message.channel.send("Put a number dummy");
    } else {
      const temperature = parseInt(messageArguments);
      message.channel.send(cToF(temperature));
    }
  }
});

if (config.rhcp_subreddit_toggle) {
  //fetch reddit posts via cron every minute
  const cron = require("node-cron");
  const pass = require("./commands/pass");

  cron.schedule("* * * * *", () => {
    try {
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
            if (e <= 62) arr.push(i);
            return arr;
          }, []);

          let lastMinutePosts = [];

          postsIndexes.forEach((i) => {
            dictionary_to_push = {
              title: decodeN.decode(
                postsJSON["data"]["children"][i]["data"]["title"].substring(
                  0,
                  255
                )
              ),
              reddit_url:
                "https://www.reddit.com/" +
                postsJSON["data"]["children"][i]["data"]["permalink"],
              media_url: postsJSON["data"]["children"][i]["data"]["url"],
              is_spoiler: postsJSON["data"]["children"][i]["data"]["spoiler"],
              thumbnail_image:
                postsJSON["data"]["children"][i]["data"]["thumbnail"],
              user: postsJSON["data"]["children"][i]["data"]["author"],
              self: decodeN.decode(
                postsJSON["data"]["children"][i]["data"]["selftext"].substring(
                  0,
                  4000
                )
              ),
            };

            if (!dictionary_to_push.thumbnail_image.startsWith("http")) {
              dictionary_to_push.thumbnail_image =
                "https://github.com/og-brandon/fleabot/blob/master/images/snoo.png?raw=true";
            }

            // replaces cases where self posts is just preview link broken
            if (dictionary_to_push.self.startsWith("&amp")) {
              dictionary_to_push.media_url = Object.values(
                postsJSON["data"]["children"][0]["data"]["media_metadata"]
              )[0]["p"][0]["u"].replace("preview", "i");
              dictionary_to_push.self = "";
            }

            lastMinutePosts.push(dictionary_to_push);
          });

          const channel = client.channels.cache.get(
            config.rhcp_subreddit_channel_ID
          );

          lastMinutePosts.forEach((post) => {
            const subredditEmbed = new MessageEmbed()
              .setColor("#ff0019")
              .setTitle(post.title)
              .setDescription(post.self)
              .setTimestamp()
              .setThumbnail(post.media_url)
              .setURL(post.reddit_url)
              .setFooter({
                text: "/u/" + post.user,
                iconURL:
                  "https://github.com/og-brandon/fleabot/blob/master/images/snoo.png?raw=true",
              });

            // if post has title but nothing else then add logo
            if (
              post.self ||
              (!post.self &&
                post.media_url.startsWith(
                  "https://www.reddit.com/r/RedHotChiliPeppers/comments"
                ))
            ) {
              subredditEmbed.setThumbnail(
                "https://github.com/og-brandon/fleabot/blob/master/images/snoo.png?raw=true"
              );
            }
            // if thumbnails is spoiler
            else if (
              dictionary_to_push.media_url.startsWith("http") === false
            ) {
              subredditEmbed.setThumbnail(
                "https://github.com/og-brandon/fleabot/blob/master/images/snoo.png?raw=true"
              );
            } else {
              subredditEmbed.setThumbnail(post.thumbnail_image);
              subredditEmbed.setDescription(post.media_url);
            }

            // if thumnbail is an image
            if (
              post.media_url.endsWith("jpg") ||
              post.media_url.endsWith("png") ||
              post.media_url.endsWith("jpeg") ||
              post.media_url.endsWith("webp") ||
              post.media_url.endsWith("gif")
            ) {
              subredditEmbed.setThumbnail(post.media_url);
              subredditEmbed.setDescription(post.media_url);
            }

            // if self contains preview reddit image that doesnt work
            if (post.self.includes("https://preview.redd.it")) {
              post.self.replace("https://preview.redd.it", "https://i.redd.it");
              subredditEmbed.setThumbnail(
                "https://github.com/og-brandon/fleabot/blob/master/images/snoo.png?raw=true"
              );
            }

            if (post.thumbnail_image.startsWith("http") === false) {
              subredditEmbed.setThumbnail(
                "https://github.com/og-brandon/fleabot/blob/master/images/snoo.png?raw=true"
              );
            }

            channel.send({ embeds: [subredditEmbed] });
          });
        });
    } catch (error) {
      logger.error(error);
    }
    l;
  });
}

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isCommand()) return;

  const command = client.commands.get(interaction.commandName);

  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (error) {
    logger.error(error);
    await interaction.reply({
      content: "There was an error while executing this command!",
      ephemeral: true,
    });
  }
});

client.login(config.token);
// fixing bot attempt 1
