import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v9";
const { clientId, token } = require("../config.json");
import fs from "fs";
import { logger } from "./logger";

const commands = [];
const commandFiles = fs
  .readdirSync(`${__dirname}/commands`)
  .filter((file: any) => file.endsWith(".js"));

for (const file of commandFiles) {
  const command = require(`${__dirname}/commands/${file}`);
  commands.push(command.default.data.toJSON());
}

const rest = new REST({ version: "9" }).setToken(token);

rest
  .put(Routes.applicationCommands(clientId), { body: commands })
  .then(() => logger.info("Successfully registered application commands."))
  .catch(console.error);
