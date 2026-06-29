import electron from "electron";
import ServerHandler from "./rust/ServerHandler.js";
import Logger from "./util/Logger.js";
electron.ipcMain.on("bridge:requestServerChange",(event,key)=>{
    Logger.log("[IPC] SERVER CHANGE REQUESTED FROM RENDERER");
    ServerHandler.select(key);
})
function refreshServers() {
    const servers = ServerHandler.fetchAll()
    electron.webContents.getAllWebContents().forEach((wc)=>{wc.send("bridge:updateServers",servers);});
}
ServerHandler.on("server-added",refreshServers);
ServerHandler.on("server-removed",refreshServers);