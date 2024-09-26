const http = require("http");
const axios = require("axios");
const { restartBot } = require("./bot");

function startHeartbeatServer(port) {
  const server = http.createServer((req, res) => {
    if (req.url === "/heartbeat") {
      res.writeHead(200, { "Content-Type": "text/plain" });
      res.end("OK");
    } else {
      res.writeHead(404, { "Content-Type": "text/plain" });
      res.end("Not Found");
    }
  });

  server.listen(port, () => {
    console.log(`Heartbeat server listening on port ${port}`);
  });
}

function startHeartbeatCheck(interval, port) {
  setInterval(async () => {
    try {
      const response = await axios.get(`http://localhost:${port}/heartbeat`);
      if (response.status !== 200) {
        console.error("Bot is unresponsive, restarting...");
        await restartBot();
      } else {
        console.log("Bot is responsive.");
      }
    } catch (error) {
      console.error("Bot is unresponsive, restarting...");
      await restartBot();
    }
  }, interval);
}

module.exports = { startHeartbeatServer, startHeartbeatCheck };