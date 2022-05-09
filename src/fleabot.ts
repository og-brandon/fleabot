import {
  Collection,
  HexColorString,
  Interaction,
  MessageEmbed,
} from "discord.js";
import fetch from "node-fetch";
import Twit from "node-tweet-stream";
import fs from "fs";
import decodeN from "html-entities";
import { logger } from "./logger";
import cron from "node-cron";
import { cToF, fToC, client } from "./utils";
import { getRandomSongSectionByArtist } from "./lyricstrivia";

const config = JSON.parse(fs.readFileSync("./config.json", "utf8"));

import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v9";
const { clientId, token } = require("../config.json");

const commands = [];
const commandFiles = fs
    .readdirSync(`${__dirname}/commands`)
    .filter((file: any) => file.endsWith(".js"));

for (const file of commandFiles) {
  const command = require(`${__dirname}/commands/${file}`);
  commands.push(command.default.data.toJSON());
}

const rest = new REST({ version: "9" }).setToken(token);

rest
    .put(Routes.applicationCommands(clientId), { body: commands })
    .then(() => {
      return logger.info("Successfully registered application commands.");
    })
    .catch(console.error);


// https://github.com/otherwisee/DiscordTwitterBot thanks for twitter guide

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
  t.on("tweet", function (tweet: any) {
    if (isReply(tweet)) {
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

  t.on("error", function (err: any) {
    logger.error(err);
  });
  let track = config.following;
  for (var i = 0; i < track.length; i++) {
    t.follow(track[i]);
    logger.info(`Following Twitter User [ID]${track[i]}`);
  }

  // twitter function
  function isReply(tweet: any) {
    return !!(
      tweet.retweeted_status ||
      tweet.in_reply_to_status_id ||
      tweet.in_reply_to_status_id_str ||
      tweet.in_reply_to_user_id ||
      tweet.in_reply_to_user_id_str ||
      tweet.in_reply_to_screen_name
    );
  }

  function chatPost(
    content: any,
    author: any,
    atAuthor: any,
    tweetURL: any,
    authorPfp: any,
    media: any
  ) {
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

    for (const __channel of config.twitter_channel.map((x: any) =>
      client.channels.cache.get(x)
    ))
      __channel.send({ embeds: [message] });
  }
}
// -------------------------------

// @ts-ignore
client.commands = new Collection();

for (const file of commandFiles) {
  const command = require(`${__dirname}/commands/${file}`);
  // Set a new item in the Collection
  // With the key as the command name and the value as the exported module
  // @ts-ignore
  client.commands.set(command.default.data.name, command);
}

client.once("ready", () => {
  logger.info("Flea is ready!");
});

// client.on("messageCreate", (message) => {
// 	if (message.content == "ping") {
// 	  message.reply("pong");
// 	}
//   });

const prefix = "!";

const waitTime = 15;
const waitTimeBot = waitTime * 1000;
const waitTimeText = `Guess in ${waitTime} seconds!`;

client.on("messageCreate", (message: any) => {
  if (!message.content.startsWith(prefix) || message.author.bot) return;

  let args = message.content.slice(prefix.length).trim().split(" ");
  const command = args.shift().toLowerCase();
  const messageArguments = args.join(" ");

  if (command === "lt" || command === "lyricstrivia") {
    message.channel.sendTyping();
    const embedColor: HexColorString = `#${Math.floor(
      Math.random() * 16777215
    ).toString(16)}`;
    try {
      getRandomSongSectionByArtist(messageArguments).then((songObject: any) => {
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
            .setDescription("An error happened 😬, try again!")
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

  if (command === "converttocelsius" || command === "ftc") {
    if (messageArguments === "") {
      message.channel.send("Put a number dummy");
    } else {
      const temperature = parseInt(messageArguments);
      message.channel.send(fToC(temperature));
    }
  }

  if (command === "converttofahrenheit" || command === "ctf") {
    if (messageArguments === "") {
      message.channel.send("Put a number dummy");
    } else {
      const temperature = parseInt(messageArguments);
      message.channel.send(cToF(temperature));
    }
  }
});

type Post = {
  title: string;
  reddit_url: string;
  media_url: string;
  is_spoiler: string;
  thumbnail_image: string;
  user: string;
  self: string;
};
if (config.rhcp_subreddit_toggle) {
  cron.schedule("* * * * *", () => {
    try {
      let postsDate: number[] = [];

      fetch(rhcpURL)
        .then((response) => response.json())
        .then((postsJSON) => {
          const subredditDate = Math.floor(Date.now() / 1000);

          for (var i = 0; i < postsJSON["data"]["children"].length; i++) {
            const utc_post =
              postsJSON["data"]["children"][i]["data"]["created_utc"];
            const seconds_since = subredditDate - utc_post;
            postsDate.push(seconds_since);
          }

          // returns list with indexes of new posts last minute
          const postsIndexes = postsDate.reduce((arr, e, i) => {
            if (e <= 62) arr.push(i);
            return arr;
          }, [] as number[]);

          let lastMinutePosts: Post[] = [];

          let post: Post | null = null;

          postsIndexes.forEach((i: any) => {
            post = {
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

            if (!post.thumbnail_image.startsWith("http")) {
              post.thumbnail_image =
                "https://github.com/og-brandon/fleabot/blob/master/images/snoo.png?raw=true";
            }

            // replaces cases where self posts is just preview link broken
            if (post.self.startsWith("&amp")) {
              // @ts-ignore
              post.media_url = Object.values(
                postsJSON["data"]["children"][0]["data"]["media_metadata"]
              )[0]["p"][0]["u"].replace("preview", "i");
              post.self = "";
            }

            lastMinutePosts.push(post);
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
            else if (post?.media_url?.startsWith("http") === false) {
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

            if (!post.thumbnail_image.startsWith("http")) {
              subredditEmbed.setThumbnail(
                "https://github.com/og-brandon/fleabot/blob/master/images/snoo.png?raw=true"
              );
            }

            // @ts-ignore
            channel?.send({ embeds: [subredditEmbed] });
          });
        });
    } catch (error) {
      logger.error(error);
    }
  });
}

client.on("interactionCreate", async (interaction: Interaction) => {
  if (!interaction.isCommand()) return;

  // @ts-ignore
  const command = client.commands.get(interaction.commandName);

  if (!command) return;

  try {
    await command.default.execute(interaction);
  } catch (error) {
    logger.error(error);
    await interaction.reply({
      content: "There was an error while executing this command!",
      ephemeral: true,
    });
  }
});

// fixing bot attempt 1
