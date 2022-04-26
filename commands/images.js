const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageEmbed } = require("discord.js");
const wait = require("node:timers/promises").setTimeout;

// const waitTime = 10
// const waitTimeBot = waitTime * 1000
// const waitTimeText = `Guess in ${waitTime} seconds!`


module.exports = {
  data: new SlashCommandBuilder()
    .setName("image")
    .setDescription("Get a random image from the band!"),
  async execute(interaction) {
    const gettyJSON = require("./rhcpGetty.json");

    randomNumber = getRandomInt(0, gettyJSON.length - 1);

    gettyTitle = gettyJSON[randomNumber]["title"];
    gettyYear = gettyJSON[randomNumber]["year"];
    gettyPeople = gettyJSON[randomNumber]["people"];
    gettyPhotographer = gettyJSON[randomNumber]["photographer"];
    gettyImg_URL = gettyJSON[randomNumber]["img_URL"];
    gettyURL = gettyJSON[randomNumber]["getty_URL"];

    const imageEmbed = new MessageEmbed()
      .setColor("#ff0019")
      .setTitle(gettyYear)
      .setURL(gettyURL)
      .setDescription(
        gettyTitle + ' [Photograph URL.]('+gettyURL+')'
      )
      .addField('People', gettyPeople, true)
      .addField('Photographer', gettyPhotographer, true)
      .setImage(gettyImg_URL)
      .setTimestamp()
      .setFooter({
        text: "Red Hot Chili Peppers Images",
        iconURL:
          "https://i.pinimg.com/originals/62/bd/2e/62bd2e623b0b6f08a672581b55c6c1a9.png",
      });

    await interaction.reply({ embeds: [imageEmbed] });
  },
};

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
  