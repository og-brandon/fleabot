import {ConfigModel} from "../config/configModel";

export abstract class Listener<P extends keyof ConfigModel> {

    shouldBeStarted(config: ConfigModel): boolean {
        const configKey = this.configKey();
        return Object.keys(config).includes(configKey) && config[configKey] === true
    }

    abstract configKey(): P

    abstract start(config: ConfigModel): Promise<void>
}