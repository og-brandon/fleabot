import {LyricsTriviaMessageHandler} from "./lyricsTriviaMessageHandler";
import {ConvertToCelsiusHandler} from "./convertToCelsiusHandler";
import {ConvertToFahrenheitHandler} from "./convertToFahrenheitHandler";

export const handlers = [
    new LyricsTriviaMessageHandler(), new ConvertToCelsiusHandler(), new ConvertToFahrenheitHandler()
]