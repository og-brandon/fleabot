const { token } = require("./config.json");
const fs = require("node:fs");
const { Client, Collection, Intents } = require("discord.js");
const fetch = require("node-fetch");
const { MessageEmbed } = require("discord.js");

const client = new Client({ intents: ["GUILDS", "GUILD_MESSAGES"] });

const rhcpURL = "https://www.reddit.com/r/redhotchilipeppers/new.json?t=hour";
rhcp_subreddit_channel_ID = "957791328752775239";

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

cron.schedule("* * * * *", () => {
  console.log(
  );

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
        lastMinutePosts.push({
          title: postsJSON["data"]["children"][i]["data"]["title"].substring(0, 255),
          reddit_url:
            "https://www.reddit.com/" +
            postsJSON["data"]["children"][i]["data"]["permalink"],
          media_url: postsJSON["data"]["children"][i]["data"]["url"],
          user: postsJSON["data"]["children"][i]["data"]["author"],
          self: postsJSON["data"]["children"][i]["data"]["selftext"].substring(0, 4000),
        });
      });
	  
      const channel = client.channels.cache.get(rhcp_subreddit_channel_ID);

      lastMinutePosts.forEach((post) => {
        const subredditEmbed = new MessageEmbed()
          .setColor("#ff0019")
          .setTitle(post.title)
          .setDescription(post.self)
          .setTimestamp()
		  .setThumbnail(
			'https://raw.githubusercontent.com/og-brandon/fleabot/master/images/snoo.png'
		  )
		  .setImage(post.media_url)
		  .setURL(post.reddit_url)
          .setFooter({
            text: '/r/RedHotChiliPeppers | u/'+ post.user,
            iconURL:
              "https://i.pinimg.com/originals/62/bd/2e/62bd2e623b0b6f08a672581b55c6c1a9.png",
          });

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

client.login(token);

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
