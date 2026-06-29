import fs from "fs";
import PATHS from "../util/Paths.js";
import path from "path";
import FCMClient from "./FCMClient.js";
import {EventEmitter} from "events";
const serverPath = path.join(PATHS.ROOT,"servers.json");



class ServerHandler extends EventEmitter {
    constructor() {
        super();
        FCMClient.on("server",this.saveServer.bind(this));
        this.selectedServer = null;
    }
    #fileExists(TargetPath) {
        return fs.existsSync(TargetPath)
    }
    #readJSON() {
        if (!this.#fileExists(serverPath)) {
            return {};
        }
        try {
            const json = fs.readFileSync(serverPath,"utf-8").trim();
            return json ? JSON.parse(json) : {};
        } catch (e) {
            return {};
        }
    }
    get selectedServerData() {
        return this.fetchAll()[this.selectedServer]
    }
    select(key) {
        this.selectedServer = key ?? null;
        this.emit("server-changed",this.selectedServerData);
        return this.selectedServer;
    }

    fetchFirstKey() {
        const json = this.#readJSON();
        const keys = Object.keys(json);
        if (keys.length === 0) {
            return {};
        }
        return keys[0];
    }
    fetchAll() {
        if (!this.#fileExists(serverPath)) {
            return {};
        }
        return JSON.parse(fs.readFileSync(serverPath,"utf8"));
    }
    saveServer(body) {
        let data = this.#readJSON();
        const key = `${body.ip}:${body.port}`;
        data[key] = {
            info: {
                name: body.name,
                desc: body.desc,
                img: body.img,
                url: body.url,
                pairTime: body.time,
            },
            ip: body.ip,
            port: body.port,
            playerId: body.playerId,
            playerToken: body.playerToken,
            devices: {},
            settings: {},
            ctx: {
                admins: {}
            }

        }
        //mainWindow.webContents.send(data);
        fs.writeFileSync(serverPath, JSON.stringify(data,null,2));
        this.emit("server-added",data);
    }
    removeServer(key) {
        let data = this.#readJSON();
        delete data[key];
        fs.writeFileSync(serverPath, JSON.stringify(data,null,2));
        this.emit("server-removed",data);
    }
}
export default new ServerHandler();