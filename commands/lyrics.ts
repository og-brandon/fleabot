// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'SlashComma... Remove this comment to see the full error message
const { SlashCommandBuilder } = require("@discordjs/builders");
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'MessageEmb... Remove this comment to see the full error message
const { MessageEmbed } = require("discord.js");
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'wait'.
const wait = require("node:timers/promises").setTimeout;

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'waitTime'.
const waitTime = 15
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'waitTimeBo... Remove this comment to see the full error message
const waitTimeBot = waitTime * 1000
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'waitTimeTe... Remove this comment to see the full error message
const waitTimeText = `Guess in ${waitTime} seconds!`

// @ts-expect-error ts-migrate(2580) FIXME: Cannot find name 'module'. Do you need to install ... Remove this comment to see the full error message
module.exports = {
  data: new SlashCommandBuilder()
    .setName("lyrics")
    .setDescription("Guess which song it is based on the lyrics!"),
  async execute(interaction: any) {
    // @ts-expect-error ts-migrate(2580) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    const rhcpJSON = require("./rhcplyrics.json");

    const songRandomNumber = getRandomInt(0, rhcpJSON.length - 1);

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'songLyrics'.
    songLyrics = rhcpJSON[songRandomNumber]["lyrics"];
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'songTitle'.
    songTitle = rhcpJSON[songRandomNumber]["title"];
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'songArt'.
    songArt = rhcpJSON[songRandomNumber]["art"];
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'songUrl'.
    songUrl = rhcpJSON[songRandomNumber]["url"];

    // purifies lyrics string a bit
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'songLyrics'.
    songLyrics = songLyrics.replace("]\n\n[", "");
    try {
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'songLyrics'.
      songLyrics = songLyrics.replace("Embed", "");
    } catch (error) {}

    // counts how many sections in the song with lyrics are there
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'songLyrics'.
    var count = (songLyrics.match(/]\n/g) || []).length;

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'randomSectionNumber'.
    randomSectionNumber = getRandomInt(0, count);

    // locates and slices section
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'songLyrics'.
    let position1 = nth_occurrence(songLyrics, "]\n", randomSectionNumber) + 1; // Plus one is needed to delete ']' character
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'songLyrics'.
    let position2 = nth_occurrence(songLyrics, "\n[", randomSectionNumber);

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'sectionChosen'.
    sectionChosen = songLyrics.slice(position1, position2);

    // console.log('Song:'+songTitle+'--------------'+sectionChosen+'---------------')

    const firstReplyEmbed = new MessageEmbed()
      .setColor("#ff0019")
      .setTitle("Guess the song title based on these lyrics:")
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'sectionChosen'.
      .setDescription(sectionChosen)
      .setTimestamp()
      .setThumbnail(
        "https://i.pinimg.com/236x/39/2e/2a/392e2a325bcaa3caafe4efb6eec5f2a9--a-dream-anthony-kiedis.jpg"
      )
      .setFooter({
        text: waitTimeText,
        iconURL:
          "https://i.pinimg.com/originals/62/bd/2e/62bd2e623b0b6f08a672581b55c6c1a9.png",
      });

    const secondReplyEmbed = new MessageEmbed()
      .setColor("#ff0019")
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'songTitle'.
      .setTitle(songTitle)
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'songUrl'.
      .setURL(songUrl)
      .setDescription(
        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'sectionChosen'.
        sectionChosen + `\nCheck this song's lyrics at [Genius.com](${songUrl})`
      )
      .setThumbnail(
        "https://i.pinimg.com/236x/39/2e/2a/392e2a325bcaa3caafe4efb6eec5f2a9--a-dream-anthony-kiedis.jpg"
      )
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'songArt'.
      .setImage(songArt)
      .setTimestamp()
      .setFooter({
        text: "Anthony Kiedis approved",
        iconURL:
          "https://i.pinimg.com/originals/62/bd/2e/62bd2e623b0b6f08a672581b55c6c1a9.png",
      });

    await interaction.reply({ embeds: [firstReplyEmbed] });
    await wait(waitTimeBot);
    await interaction.editReply({ embeds: [secondReplyEmbed] });
  },
};

function getRandomInt(min: any, max: any) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// https://stackoverflow.com/questions/12744995/finding-the-nth-occurrence-of-a-character-in-a-string-in-javascript
// @ts-expect-error ts-migrate(7023) FIXME: 'nth_occurrence' implicitly has return type 'any' ... Remove this comment to see the full error message
function nth_occurrence(string: any, char: any, nth: any) {
  var first_index = string.indexOf(char);
  var length_up_to_first_index = first_index + 1;

  if (nth == 1) {
    return first_index;
  } else {
    var string_after_first_occurrence = string.slice(length_up_to_first_index);
    // @ts-expect-error ts-migrate(7022) FIXME: 'next_occurrence' implicitly has type 'any' becaus... Remove this comment to see the full error message
    var next_occurrence = nth_occurrence(
      string_after_first_occurrence,
      char,
      nth - 1
    );

    if (next_occurrence === -1) {
      return -1;
    } else {
      return length_up_to_first_index + next_occurrence;
    }
  }
}
