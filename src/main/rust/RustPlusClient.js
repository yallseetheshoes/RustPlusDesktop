import rustPlus from "@liamcottle/rustplus.js";
import {EventEmitter} from "events";
import MessageHandler from "./MessageHandler.js";
import Logger from "../util/Logger.js";
import Config from "../util/Config.js"
import electron from "electron";
import ServerHandler from "./ServerHandler.js";
class RustPlusClient extends EventEmitter {
    constructor() {
        super()
        this.connected = false;
    }
    connect(rustPlusConfig) {
        Logger.log("[RUST+] CREATING CLIENT...");
        if (this.client) {
            Logger.log("[RUST+] DISCONNECTING...")
            this.client.disconnect();
        }
        this.client = new rustPlus(
            rustPlusConfig.ip,rustPlusConfig.port,rustPlusConfig.playerId,rustPlusConfig.playerToken
        )
        Logger.log("[RUST+] CONNECTING...");
        this.client.connect();
        this.client.on("message",(msg)=>{
            this.emit("message",msg);
            MessageHandler.interpretMessage(msg);
        });
        this.client.on("connected",()=>{
            this.connected = true;
            this.client.getTeamInfo((team_info)=>{
                if (team_info.response?.error) {
                    Logger.log(`\x1b[31m[RUST+] INVALID TOKEN DETECTED\x1b[0m`)
                    electron.webContents.getAllWebContents().forEach(wc => {wc.send("bridge:tokenError");})
                } else {
                    Logger.log(`[RUST+] NEW TEAM INFO: ${JSON.stringify(team_info.response.teamInfo,null,2)}`)
                    electron.webContents.getAllWebContents().forEach(wc => {wc.send("bridge:setCurrentServer",ServerHandler.selectedServerData);})
                }
            });
            Logger.log("[RUST+] \x1b[32mCONNECTED\x1b[0m");
            if (Config.get("PostTeamMessageOnConnect")) {
                this.client.sendRequest({sendTeamMessage:{message:"Connected"}});
            }
            this.emit("connected");
        });
        this.client.on("disconnected",()=>{
            this.connected = false;
            this.emit("disconnected");
        });
        this.client.on("error", (err) => {
            console.log(err);
            this.emit("error", err);
        });
    }
    sendRequest(data,callback) {
        this.client.sendRequest(data,(msg)=>{
            if (callback) callback(msg);
        });
    }
}
export default RustPlusClient;
