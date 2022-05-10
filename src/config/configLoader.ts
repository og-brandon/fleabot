import fs from "fs";
import {ConfigModel} from "./configModel";

export function loadConfig(): ConfigModel {
    return JSON.parse(fs.readFileSync("./config.json", "utf8")) as ConfigModel;
}