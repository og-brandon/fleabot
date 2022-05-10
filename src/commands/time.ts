import { SlashCommandBuilder } from "@discordjs/builders";
import {
  CommandInteraction,
  EmbedFieldData,
  MessageEmbed,
  User,
} from "discord.js";
import moment from "moment-timezone";
import { client } from "../utils";
import {logger} from "../logger";
import fs from "fs";
import {Command} from "./command";

const config = JSON.parse(fs.readFileSync("./config.json", "utf8"));

const knownUsersToTimezones: Record<string, string[]> = config.tzUserRegistry;

export const timeCommand: Command =  {
  data: new SlashCommandBuilder()
    .setName("coffeetime")
    .setDescription("Calculates the current time for Coffee Shop members")
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

    const fields: EmbedFieldData[] = [];
    for (let tz of Object.keys(knownUsersToTimezones)) {
      const userIds: string[] = knownUsersToTimezones[tz];
      const users = await Promise.all(userIds.map(userId => client.users.fetch(userId)))
      const m = moment().utc().add(offset, "hours").tz(tz, false);
      fields.push({
        name: m.format("HH:mm:ss"),
        value: users.map((user) => user.username).join(", "),
      });
    }

    const passEmbed = new MessageEmbed()
      .setTitle(`Current local times of coffee fellows ${offset !== 0 ? `in ${offset} hours` : ""}`)
      .addFields(fields)
      .setColor("#c8ff00");
    await interaction.editReply({ embeds: [passEmbed] });
  },
};
