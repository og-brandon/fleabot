// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'SlashComma... Remove this comment to see the full error message
const { SlashCommandBuilder } = require("@discordjs/builders");
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'MessageEmb... Remove this comment to see the full error message
const { MessageEmbed } = require("discord.js");
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'wait'.
const wait = require("node:timers/promises").setTimeout;

// const waitTime = 10
// const waitTimeBot = waitTime * 1000
// const waitTimeText = `Guess in ${waitTime} seconds!`


// @ts-expect-error ts-migrate(2580) FIXME: Cannot find name 'module'. Do you need to install ... Remove this comment to see the full error message
module.exports = {
  data: new SlashCommandBuilder()
    .setName("image")
    .setDescription("Get a random image from the band!"),
  async execute(interaction: any) {
    // @ts-expect-error ts-migrate(2580) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    const gettyJSON = require("./rhcpGetty.json");

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'randomNumber'.
    randomNumber = getRandomInt(0, gettyJSON.length - 1);

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'gettyTitle'.
    gettyTitle = gettyJSON[randomNumber]["title"];
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'gettyYear'.
    gettyYear = gettyJSON[randomNumber]["year"];
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'gettyPeople'.
    gettyPeople = gettyJSON[randomNumber]["people"];
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'gettyPhotographer'.
    gettyPhotographer = gettyJSON[randomNumber]["photographer"];
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'gettyImg_URL'.
    gettyImg_URL = gettyJSON[randomNumber]["img_URL"];
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'gettyURL'.
    gettyURL = gettyJSON[randomNumber]["getty_URL"];

    const imageEmbed = new MessageEmbed()
      .setColor("#ff0019")
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'gettyYear'.
      .setTitle(gettyYear)
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'gettyURL'.
      .setURL(gettyURL)
      .setDescription(
        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'gettyTitle'.
        gettyTitle + ' [Photograph URL.]('+gettyURL+')'
      )
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'gettyPeople'.
      .addField('People', gettyPeople, true)
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'gettyPhotographer'.
      .addField('Photographer', gettyPhotographer, true)
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'gettyImg_URL'.
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

// @ts-expect-error ts-migrate(2393) FIXME: Duplicate function implementation.
function getRandomInt(min: any, max: any) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
  