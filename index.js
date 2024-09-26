const { startBot } = require("./bot.js");
const { startHeartbeatServer, startHeartbeatCheck } = require("./heartbeat.js");

(async () => {
  try {
    console.log("Starting bot...");
    await startBot();
  } catch (error) {
    console.error("Error starting bot:", error);
    process.exit(1);
  }
})();

startHeartbeatServer(3000);
startHeartbeatCheck(60000, 3000);