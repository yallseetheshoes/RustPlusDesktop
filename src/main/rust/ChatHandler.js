class MessageHandler {
    constructor() {
        this.commands = new Map();
    }
    register(name,callback) {
        this.commands.set(name,callback);
    }
    execute(name,args,ctx) {
        const command = this.commands.get(name);
        if (!command) return false;
        command(args,ctx);
    }
    interpretMessage(msg) {
        const text = msg?.teamMessage?.message?.message;
        if (text) {
            const split = text.split(" ");
            const name = split[0];
            const args = split.slice(1);
            this.execute(name,args)
        }
    }
}
export default new MessageHandler();