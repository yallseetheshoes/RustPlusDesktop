import ChatHandler from "./ChatHandler.js";
import Logger from "../util/Logger.js";
class MessageHandler {
    interpretMessage(msg) {
        Logger.log(`[MESSAGE HANDLER] NEW MESSAGE: ${JSON.stringify(msg)}`)
        if (msg.broadcast) {
            switch (msg.broadcast) {
                case "teamMessage":
                    ChatHandler.interpretMessage(msg.broadcast);
                    break;
            }
        }
    }
}
export default new MessageHandler();