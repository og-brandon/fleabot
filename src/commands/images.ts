import { SlashCommandBuilder } from "@discordjs/builders";
import { MessageEmbed } from "discord.js";
import gettyJSON from "./rhcpGetty.json";
export default {
  data: new SlashCommandBuilder()
    .setName("image")
    .setDescription("Get a random image from the band!"),
  async execute(interaction: any) {
    const randomNumber = getRandomInt(0, gettyJSON.length - 1);

    const gettyTitle = gettyJSON[randomNumber]["title"];
    const gettyYear = gettyJSON[randomNumber]["year"];
    const gettyPeople = gettyJSON[randomNumber]["people"];
    const gettyPhotographer = gettyJSON[randomNumber]["photographer"];
    const gettyImg_URL = gettyJSON[randomNumber]["img_URL"];
    const gettyURL = gettyJSON[randomNumber]["getty_URL"];

    const imageEmbed = new MessageEmbed()
      .setColor("#ff0019")
      .setTitle(gettyYear)
      .setURL(gettyURL)
      .setDescription(gettyTitle + " [Photograph URL.](" + gettyURL + ")")
      .addField("People", gettyPeople, true)
      .addField("Photographer", gettyPhotographer, true)
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

function getRandomInt(min: any, max: any) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
