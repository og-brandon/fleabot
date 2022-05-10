import { SlashCommandBuilder } from "@discordjs/builders";
import {
  Collection,
  CommandInteraction,
  EmbedFieldData,
  MessageEmbed,
  Role,
} from "discord.js";
import moment from "moment-timezone";
import fs from "fs";
import { Command } from "./command";
import { Snowflake } from "discord-api-types/v9";

const config = JSON.parse(fs.readFileSync("./config.json", "utf8"));

export const timeCommand: Command = {
  data: new SlashCommandBuilder()
    .setName("coffeetime")
    .setDescription("Calculates the current time for server members")
    .addNumberOption((option) =>
      option
        .setName("offset-hours")
        .setDescription(
          "The offset between now and the target time in hours. Defaults to 0"
        )
        .setMinValue(0)
        .setMaxValue(24)
        .setRequired(false)
    ) as SlashCommandBuilder,
  async execute(interaction: CommandInteraction) {
    await interaction.deferReply();
    const offset: number =
        interaction.options.getNumber("offset-hours", false) || 0;

    const roles: Collection<Snowflake, Role> =
      (await interaction.guild?.roles?.fetch()) ||
      new Collection<Snowflake, Role>();
    const tzRoles = roles.filter((role) => role.name.startsWith("TZ"))
    const fields: EmbedFieldData[] = [];

    for (let role of tzRoles.values()) {
      const tz = role.name.replace("TZ:", "")
      const m = moment().utc().add(offset, "hours").tz(tz, false);
      fields.push({
        name: m.format("HH:mm:ss"),
        value: role.members.map((member) => member.user.username).join(", "),
      });
    }

    const passEmbed = new MessageEmbed()
      .setTitle(
        `Current local times of your fellow members ${
          offset !== 0 ? `in ${offset} hours` : ""
        }`
      )
      .addFields(fields)
      .setColor("#c8ff00");
    await interaction.editReply({ embeds: [passEmbed] });
  },
};
