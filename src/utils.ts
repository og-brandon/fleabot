import {Client, Message} from "discord.js";
import fs from "fs";
import {MESSAGE_PREFIX} from "./constants";

const config = JSON.parse(fs.readFileSync("./config.json", "utf8"));

export const client = new Client({ intents: ["GUILDS", "GUILD_MESSAGES"] });
void client.login(config.token);

export function nth_occurrence(string: any, char: any, nth: any): number {
  const first_index = string.indexOf(char);
  const length_up_to_first_index = first_index + 1;

  if (nth == 1) {
    return first_index;
  } else {
    const string_after_first_occurrence = string.slice(
      length_up_to_first_index
    );
    const next_occurrence = nth_occurrence(
      string_after_first_occurrence,
      char,
      nth - 1
    );

    if (next_occurrence === -1) {
      return -1;
    } else {
      return length_up_to_first_index + next_occurrence;
    }
  }
}

export function getRandomInt(min: any, max: any) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function extractMessageWithoutCommand(message: Message, prefix = MESSAGE_PREFIX) {
  const args = message.content.slice(prefix.length).trim().split(" ");
  args.shift()
  return args;
}

export function extractCommand(message: Message, prefix = MESSAGE_PREFIX) {
  const args = message.content.slice(prefix.length).trim().split(" ");
  return args[0];
}