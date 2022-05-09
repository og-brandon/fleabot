// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'SlashComma... Remove this comment to see the full error message
const { SlashCommandBuilder } = require("@discordjs/builders");
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'MessageEmb... Remove this comment to see the full error message
const { MessageEmbed } = require("discord.js");

// @ts-expect-error ts-migrate(2580) FIXME: Cannot find name 'module'. Do you need to install ... Remove this comment to see the full error message
module.exports = {
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
