import electron from "electron";
import ServerHandler from "./rust/ServerHandler.js";
import fcmClient from "./rust/FCMClient.js";
import RustPlusClient from "./rust/RustPlusClient.js";
import Logger from "./util/Logger.js";
import path from "path";
import PATHS from "./util/Paths.js";
import "./IPC.js"
import Config from "./util/Config.js"
const rustPlus = new RustPlusClient();


function createWindow(w,h,p,options = {},webPreferences = {}) { //window helper thing idk
    const win = new electron.BrowserWindow({
        width: w,
        height: h,
        webPreferences: {
            preload: path.join(p,"preload.js"),
            ...webPreferences
        },

        ...options
    })
    win.loadFile(path.join(p,"index.html"));
    win.removeMenu();
    return win;
}


let mainWindow;
electron.app.on("ready",async ()=>{
    mainWindow = createWindow(1000,700,path.join(PATHS.Windows,"main"),{
        minWidth: 1000,
        minHeight: 700
    });

    ServerHandler.on("server-changed",(newServer)=>{
        rustPlus.connect(
            {
                ip: newServer.ip,
                port: newServer.port,
                playerId: newServer.playerId,
                playerToken: newServer.playerToken
            }
        )
    });


    //tiny wait cuz of UX idk
        setTimeout(async()=>{
            const firstKey = ServerHandler.fetchFirstKey();
            if (firstKey) {
                ServerHandler.select(firstKey);
            }

            if (Config.get("OpenDevToolOnStartup")) {
                mainWindow.webContents.openDevTools();
            }
            let progress = {fcm:0,rustplus:0};
            progress.fcm = 10;
            mainWindow.webContents.send("startup:update",progress);
            fcmClient.on("alarm",()=>{
                Logger.log("[FCM] \x1b[5;31mRaid alarm\x1b[0m")
            });
            await fcmClient.start();
            progress.fcm = 100;
            mainWindow.webContents.send("startup:update",progress);
            progress.rustplus = 20;
            mainWindow.webContents.send("startup:update",progress);
            const server = ServerHandler.selectedServerData
            mainWindow.webContents.send("bridge:updateServers",ServerHandler.fetchAll())
            setTimeout(()=>{
                mainWindow.webContents.send("bridge:setCurrentServer",server);
                progress.rustplus = 100;
                mainWindow.webContents.send("startup:update",progress);
            },1000)
        },2000);
});