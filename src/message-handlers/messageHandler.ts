import {Message} from "discord.js";
import {extractCommand, extractMessageWithoutCommand} from "../utils";

export abstract class MessageHandler {

    abstract triggerMessageSubstrings(): string[]

    canHandle(message: Message): boolean {
        const command = extractCommand(message)
        return (this.triggerMessageSubstrings().find(substr => command === substr)?.length || 0) !== 0
    }

    abstract handle(message: Message): Promise<void>
}