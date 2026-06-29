class Logger {
    log(text,includeTime=true) {
        let msg = text
        if (includeTime) {
            msg = `[${new Date().toLocaleTimeString("en-US")}] ${msg}`
        }
        console.log(msg)
    }
}
export default new Logger();