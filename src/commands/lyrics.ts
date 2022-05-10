import { SlashCommandBuilder } from "@discordjs/builders";
import {CommandInteraction, Interaction, MessageEmbed} from "discord.js";
import { setTimeout } from "node:timers/promises";
import { getRandomInt, nth_occurrence } from "../utils";

import rhcpJSON from "./rhcplyrics.json";
import {Command} from "./command";

const waitTime = 15;
const waitTimeBot = waitTime * 1000;
const waitTimeText = `Guess in ${waitTime} seconds!`;

export const lyricsCommand: Command =  {
  data: new SlashCommandBuilder()
    .setName("lyrics")
    .setDescription("Guess which song it is based on the lyrics!"),
  async execute(interaction: CommandInteraction) {
    const songRandomNumber = getRandomInt(0, rhcpJSON.length - 1);

    let songLyrics = rhcpJSON[songRandomNumber]["lyrics"];
    const songTitle = rhcpJSON[songRandomNumber]["title"];
    const songArt = rhcpJSON[songRandomNumber]["art"];
    const songUrl = rhcpJSON[songRandomNumber]["url"];

    // purifies lyrics string a bit
    songLyrics = songLyrics.replace("]\n\n[", "");
    try {
      songLyrics = songLyrics.replace("Embed", "");
    } catch (error) {}

    // counts how many sections in the song with lyrics are there
    const count = (songLyrics.match(/]\n/g) || []).length;

    const randomSectionNumber = getRandomInt(0, count);

    // locates and slices section
    let position1 = nth_occurrence(songLyrics, "]\n", randomSectionNumber) + 1; // Plus one is needed to delete ']' character
    let position2 = nth_occurrence(songLyrics, "\n[", randomSectionNumber);

    const sectionChosen = songLyrics.slice(position1, position2);

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
        sectionChosen + `\nCheck this song's lyrics at [Genius.com](${songUrl})`
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
    await setTimeout(waitTimeBot);
    await interaction.editReply({ embeds: [secondReplyEmbed] });
  },
};
