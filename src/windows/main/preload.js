const electron = require("electron");

electron.contextBridge.exposeInMainWorld("startup",{
    onLoadingUpdate(callback) {
        electron.ipcRenderer.on("startup:update", (_, data) => callback(data));
    },

})
electron.contextBridge.exposeInMainWorld("bridge",{
    updateServers(callback) {
        electron.ipcRenderer.on("bridge:updateServers",(_,data)=>callback(data));
    },
    setCurrentServer(callback) {
        electron.ipcRenderer.on("bridge:setCurrentServer",(_,data)=>callback(data));
    },
    requestServerChange(serverKey) {
        electron.ipcRenderer.send("bridge:requestServerChange",serverKey);
    },
    tokenError(callback) {
        electron.ipcRenderer.on("bridge:tokenError",(_,data)=>callback(data));

    }
})
