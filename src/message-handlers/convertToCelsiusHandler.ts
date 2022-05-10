import {MessageHandler} from "./messageHandler";
import {Message} from "discord.js";
import {extractMessageWithoutCommand} from "../utils";

export class ConvertToCelsiusHandler extends MessageHandler {

    triggerMessageSubstrings(): string[] {
        return ["ctc", "converttocelsius"]
    }

    async handle(message: Message): Promise<void> {
        const messageArguments = extractMessageWithoutCommand(message)
        if (!messageArguments) {
            message.channel.send("Put a number dummy");
        } else {
            const temperature = parseInt(messageArguments[0]);
            message.channel.send(ConvertToCelsiusHandler.fToC(temperature));
        }
    }

    private static fToC(fahrenheit: number) {
        const fTemp = fahrenheit;
        const fToCel = ((fTemp - 32) * 5) / 9;
        const rounded = Math.round(fToCel * 10) / 10
        return fTemp + "\xB0F is " + rounded + "\xB0C.";
    }

}