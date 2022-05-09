// @ts-expect-error ts-migrate(2580) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
const { REST } = require("@discordjs/rest");
// @ts-expect-error ts-migrate(2580) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
const { Routes } = require("discord-api-types/v9");
// @ts-expect-error ts-migrate(2580) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
const { clientId, token } = require("./config.json");
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'fs'.
const fs = require("node:fs");
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'logger'.
const { logger } = require("./logger");

const commands = [];
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'commandFil... Remove this comment to see the full error message
const commandFiles = fs
  .readdirSync("./commands")
  .filter((file: any) => file.endsWith(".js"));

for (const file of commandFiles) {
  // @ts-expect-error ts-migrate(2580) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
  const command = require(`./commands/${file}`);
  commands.push(command.data.toJSON());
}

const rest = new REST({ version: "9" }).setToken(token);

rest
  .put(Routes.applicationCommands(clientId), { body: commands })
  .then(() => logger.info("Successfully registered application commands."))
  .catch(console.error);
