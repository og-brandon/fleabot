import { SlashCommandBuilder } from "@discordjs/builders";
import { MessageEmbed } from "discord.js";

export default {
  data: new SlashCommandBuilder()
    .setName("passdown")
    .setDescription("Pass down the stratocaster!"),
  async execute(interaction: any) {
    const passEmbed = new MessageEmbed()
      .setTitle("Pass the Stratocaster down")
      .setColor("#ff0019")
      .setImage(
        "https://raw.githubusercontent.com/og-brandon/fleabot/master/images/pass.gif"
      );

    await interaction.reply({ embeds: [passEmbed] });
  },
};
