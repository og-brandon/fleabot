import {MessageHandler} from "./messageHandler";
import {Message} from "discord.js";
import {extractMessageWithoutCommand} from "../utils";

export class ConvertToFahrenheitHandler extends MessageHandler {

    triggerMessageSubstrings(): string[] {
        return ["ctf", "converttofahrenheit"]
    }

    async handle(message: Message): Promise<void> {
        const messageArguments = extractMessageWithoutCommand(message)
        if (!messageArguments) {
            message.channel.send("Put a number dummy");
        } else {
            const temperature = parseInt(messageArguments[0]);
            message.channel.send(ConvertToFahrenheitHandler.cToF(temperature));
        }
    }

    private static cToF(celsius: any) {
        const cTemp = celsius;
        const cToFahr = (cTemp * 9) / 5 + 32;
        const rounded = Math.round(cToFahr * 10) / 10
        return cTemp + "\xB0C is " + rounded + " \xB0F.";
    }

}