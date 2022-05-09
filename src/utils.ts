import {Client} from "discord.js";
import fs from "fs";

const config = JSON.parse(fs.readFileSync("./config.json", "utf8"));

const discordClient = new Client({ intents: ["GUILDS", "GUILD_MESSAGES"] });
discordClient.login(config.token);

export const client = discordClient;

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

export function cToF(celsius: any) {
  const cTemp = celsius;
  const cToFahr = (cTemp * 9) / 5 + 32;
  const rounded = Math.round(cToFahr * 10) / 10
  return cTemp + "\xB0C is " + rounded + " \xB0F.";
}

export function fToC(fahrenheit: any) {
  const fTemp = fahrenheit;
  const fToCel = ((fTemp - 32) * 5) / 9;
  const rounded = Math.round(fToCel * 10) / 10
  return fTemp + "\xB0F is " + rounded + "\xB0C.";
}
