const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageEmbed } = require("discord.js");
const wait = require("node:timers/promises").setTimeout;

const waitTime = 10
const waitTimeBot = waitTime * 1000
const waitTimeText = `Guess in ${waitTime} seconds!`

module.exports = {
  data: new SlashCommandBuilder()
    .setName("trivia")
    .setDescription("Answer the bots trivia!"),
  async execute(interaction) {
    const rhcpJSON = require("./rhcplyrics.json");

    const songRandomNumber = getRandomInt(0, rhcpJSON.length - 1);

    songLyrics = rhcpJSON[songRandomNumber]["lyrics"];
    songTitle = rhcpJSON[songRandomNumber]["title"];
    songArt = rhcpJSON[songRandomNumber]["art"];
    songUrl = rhcpJSON[songRandomNumber]["url"];

    // purifies lyrics string a bit
    songLyrics = songLyrics.replace("]\n\n[", "");
    try {
      songLyrics = songLyrics.replace("Embed", "");
    } catch (error) {}

    // counts how many sections in the song with lyrics are there
    var count = (songLyrics.match(/]\n/g) || []).length;

    randomSectionNumber = getRandomInt(0, count);

    // locates and slices section
    let position1 = nth_occurrence(songLyrics, "]\n", randomSectionNumber) + 1; // Plus one is needed to delete ']' character
    let position2 = nth_occurrence(songLyrics, "\n[", randomSectionNumber);

    sectionChosen = songLyrics.slice(position1, position2);

    // console.log('Song:'+songTitle+'--------------'+sectionChosen+'---------------')

    const firstReplyEmbed = new MessageEmbed()
      .setColor("#ff0019")
      .setTitle("Guess the song title based on these lyrics:")
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
      .setTitle(songTitle)
      .setURL(songUrl)
      .setDescription(
        "Check this song's lyrics on [Genius.com](" + songUrl + ")"
      )
      .setThumbnail(
        "https://i.pinimg.com/236x/39/2e/2a/392e2a325bcaa3caafe4efb6eec5f2a9--a-dream-anthony-kiedis.jpg"
      )
      .setImage(songArt)
      .setTimestamp()
      .setFooter({
        text: "Anthony Kiedis approved",
        iconURL:
          "https://i.pinimg.com/originals/62/bd/2e/62bd2e623b0b6f08a672581b55c6c1a9.png",
      });

    await interaction.reply({ embeds: [firstReplyEmbed] });
    await wait(waitTimeBot);
    await interaction.followUp({ embeds: [secondReplyEmbed] });
  },
};

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// https://stackoverflow.com/questions/12744995/finding-the-nth-occurrence-of-a-character-in-a-string-in-javascript
function nth_occurrence(string, char, nth) {
  var first_index = string.indexOf(char);
  var length_up_to_first_index = first_index + 1;

  if (nth == 1) {
    return first_index;
  } else {
    var string_after_first_occurrence = string.slice(length_up_to_first_index);
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
