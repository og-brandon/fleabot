const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageEmbed } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("passdown")
    .setDescription("Pass down the stratocaster!"),
  async execute(interaction) {
    const passEmbed = new MessageEmbed()
      .setTitle("Pass the Stratocaster down")
      .setColor("#ff0019")
      .setImage(
        "https://media.discordapp.net/attachments/956617892181475431/957040927657062480/pass.gif"
      );

    await interaction.reply({ embeds: [passEmbed] });
  },
};

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
