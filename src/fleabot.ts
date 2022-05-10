import { Interaction, Message } from "discord.js";
import { logger } from "./logger";
import { client } from "./utils";
import { handlers } from "./message-handlers";
import { listeners } from "./listeners";
import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v9";
import { MESSAGE_PREFIX } from "./constants";
import { loadConfig } from "./config/configLoader";
import { commands } from "./commands";

const config = loadConfig();

client.once("ready", async() => {
  const errors: Error[] = [];
  logger.info("Flea is preparing...");

  logger.info("Starting to set up routes...");
  try {
    const rest = new REST({ version: "9" }).setToken(config.token);
    await rest.put(Routes.applicationCommands(config.clientId), {body: commands.map(cmd => cmd.data.toJSON())})
    logger.info("Successfully registered application commands.");
  } catch (e) {
    errors.push(e as Error);
    logger.error(e)
  }

  logger.info("Setting up listeners...!");
  for (const listener of listeners.filter(li => li.shouldBeStarted(config))) {
    try {
      await listener.start(loadConfig())
    } catch (e) {
      errors.push(e as Error);
      logger.error(e)
    }
  }
  logger.info("Listeners set up");
  logger.info(`Flea is ready. There were ${errors.length === 0 ? "no errors" : "errors"} during startup`);
});

client.on("messageCreate", async (message: Message) => {
  if (!message.content.startsWith(MESSAGE_PREFIX) || message.author.bot) return;
  const matchingHandlers = handlers
      .filter((handler) => handler.canHandle(message));

  for (const matchingHandler of matchingHandlers) {
    logger.info("MessageCreate called with a matching string.");
    try {
      await matchingHandler.handle(message);
      logger.info("Message handled");
    } catch (e) {
      logger.error(e);
    }
  }
});

client.on("interactionCreate", async (interaction: Interaction) => {
  if (!interaction.isCommand()) return;
  const matchingCommands = commands
      .filter((cmd) => cmd.data.name === interaction.commandName);
  for (const foundCmd of matchingCommands) {
    try {
      await foundCmd.execute(interaction);
    } catch (error) {
      logger.error(error);
      await interaction.reply({
        content: "There was an error while executing this command!",
        ephemeral: true,
      });
    }
  }
});
