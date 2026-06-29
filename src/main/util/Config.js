import PATHS from "./Paths.js"
import fs from "fs";
import path from "path";
const configPath = path.join(PATHS.ROOT,"config.json");
const defaults = {
    PostTeamMessageOnConnect: true,
    OpenDevToolOnStartup: false,
}
class Config {
    #read() {
        if (!fs.existsSync(configPath)) return defaults
        try {
            return {...defaults, ...JSON.parse(fs.readFileSync(configPath,"utf-8"))}
        } catch {
            return {...defaults}
        }
    }
    get(key) {
        return this.#read()[key];
    }
    set(key,value) {
        const data = this.#read();
        data[key] = value;
        fs.writeFileSync(configPath,JSON.stringify(data,null,2));
    }
    getAll() {
        return this.#read();
    }
}
export default new Config();