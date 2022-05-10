import { MessageHandler } from "./messageHandler";
import { HexColorString, Message, MessageEmbed } from "discord.js";
import { getRandomSongSectionByArtist } from "./lyricsTriviaService";
import { logger } from "../logger";
import { extractMessageWithoutCommand } from "../utils";

const WAIT_TIME_SECONDS = 15;

export class LyricsTriviaMessageHandler extends MessageHandler {

  triggerMessageSubstrings(): string[] {
      return ["lt", "lyricstrivia"]
  }

  async handle(message: Message): Promise<void> {
    message.channel.sendTyping();
    const embedColor: HexColorString = `#${Math.floor(
      Math.random() * 16777215
    ).toString(16)}`;

    const messageArguments = extractMessageWithoutCommand(message);

    if (!messageArguments) return

    try {
      getRandomSongSectionByArtist(messageArguments).then((songObject: any) => {
        if (!songObject) {
          message.channel.send(
            "An error happened 😬 Please try again, it might work."
          );
          return;
        }

        try {
          const songEmbed = new MessageEmbed()
            .setColor(embedColor)
            .setTitle("Guess this song from " + songObject.artist)
            .setDescription(songObject.section)
            .setTimestamp()
            .setThumbnail(
              "https://ichef.bbci.co.uk/news/976/cpsprodpb/13F53/production/_83874718_thinkstockphotos-104548222.jpg"
            )
            .setFooter({
              text: `💿 Guess in ${WAIT_TIME_SECONDS} seconds`,
            });

          const songSecondEmbed = new MessageEmbed()
            .setColor(embedColor)
            .setTitle(songObject.title)
            .setTimestamp()
            .setImage(songObject.art)
            .setURL(songObject.url)
            .setFooter({
              text: "💿 - " + songObject.artist,
            });
          message.channel.send({ embeds: [songEmbed] });
          setTimeout(() => {
            message.channel.send({
              embeds: [songSecondEmbed],
            });
          }, WAIT_TIME_SECONDS * 1000);
        } catch (error) {
          const songSecondEmbed = new MessageEmbed()
            .setColor(embedColor)
            .setDescription("An error happened 😬, try again!")
            .setTimestamp();

          message.channel.send({ embeds: [songSecondEmbed] });
        }
      });
    } catch (error) {
      logger.error(error);
      message.channel.send(
        "An error happened 😬 Please try again, it might work."
      );
    }
  }
}
