const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageEmbed } = require("discord.js");
const wait = require("node:timers/promises").setTimeout;

module.exports = {
  data: new SlashCommandBuilder()
    .setName("images")
    .setDescription("Guess the year of the image!"),
  async execute(interaction) {
    const gettyJSON = require("./rhcpGetty.json");

    randomNumber = getRandomInt(0, gettyJSON.length - 1);

    gettyTitle = gettyJSON[randomNumber]["title"];
    gettyYear = gettyJSON[randomNumber]["year"];
    gettyPeople = gettyJSON[randomNumber]["people"];
    gettyPhotographer = gettyJSON[randomNumber]["photographer"];
    gettyImg_URL = gettyJSON[randomNumber]["img_URL"];
    gettyURL = gettyJSON[randomNumber]["getty_URL"];

    const firstReplyEmbed = new MessageEmbed()
      .setColor("#ff0019")
      .setTitle("Guess the year this photo was taken:")
      .setTimestamp()
      .setImage(gettyImg_URL)
      .setFooter({
        text: "Guess in 15 seconds!",
        iconURL:
          "https://i.pinimg.com/originals/62/bd/2e/62bd2e623b0b6f08a672581b55c6c1a9.png",
      });

    const secondReplyEmbed = new MessageEmbed()
      .setColor("#ff0019")
      .setTitle(gettyYear)
      .setURL(gettyURL)
      .setDescription(
        gettyTitle + ' [Photograph URL.]('+gettyURL+')'
      )
      .addField('People', gettyPeople, true)
      .addField('Photographer', gettyPhotographer, true)
      .setThumbnail(gettyImg_URL)
      .setTimestamp()
      .setFooter({
        text: "gettyimages",
        iconURL:
          "https://i.pinimg.com/originals/62/bd/2e/62bd2e623b0b6f08a672581b55c6c1a9.png",
      });

    await interaction.reply({ embeds: [firstReplyEmbed] });
    await wait(15000);
    await interaction.followUp({ embeds: [secondReplyEmbed] });
  },
};

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
  