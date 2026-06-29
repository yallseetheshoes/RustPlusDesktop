import {EventEmitter} from "events";
import {fcmRegister, fcmListen} from "./cli/index.js";
import path from "path";
import fs from "fs";
import Logger from "../util/Logger.js";

const fcmOptions = {"config-file": "rustplus.config.json"}

class FCMClient extends EventEmitter   {
    constructor() {
        super()
        this.started = false;
    }
    async start() {

        if (this.started) return;
        this.started = true;
        if (!fs.existsSync(path.join(process.cwd(),"rustplus.config.json"))) {
            Logger.log("[FCM] FCM REGISTERING...");
            await fcmRegister(fcmOptions);
        }
        Logger.log("[FCM] CONNECTING...");
        this.client = await fcmListen(fcmOptions);
        this.client.connect();
        this.client.on("ON_DATA_RECEIVED",this._onDataReceived.bind(this));
        Logger.log("[FCM] \x1b[32mCONNECTED\x1b[0m");
    }
    stop() {
        if (!this.started) return;
        this.client.close();
        this.client.off("ON_DATA_RECEIVED",this._onDataReceived);
        this.started = false;
    }
    _onDataReceived(data) {
        const body = JSON.parse(data.appData.find(x => x.key === 'body')?.value);
        body.notification = data.appData.find(
            x => x.key === 'gcm.notification.body'
        )?.value; // include notification
        body.time = Number(data.sent); // and timestamp
        this.emit("message",body);
        if (body.type) this.emit(body.type,body);
        console.log(JSON.stringify(body,null,2));
    }
}
export default new FCMClient();
