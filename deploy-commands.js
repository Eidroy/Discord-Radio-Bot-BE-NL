const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v9");
const { clientId, token } = require("./config.json");
const { readFileSync } = require("fs");
const { join } = require("path");

const commands = [
  { name: "top", description: "Play top radio stream" },
  { name: "mnm", description: "Play MNM radio stream" },
  { name: "qmusic", description: "Play Qmusic radio stream" },
  { name: "stubru", description: "Play Studio Brussel radio stream" },
  { name: "fg", description: "Play Radio FG stream" },
  { name: "slam", description: "Play SlamFM stream" },
  { name: "radio538", description: "Play Radio 538 stream" },
  { name: "qmusicnl", description: "Play Qmusic NL stream" },
  { name: "sky", description: "Play Sky Radio stream" },
  { name: "disconnect", description: "Disconnect from voice channel" },
  { name: "invite", description: "Get the invite link of the bot" },
];

const rest = new REST({ version: "9" }).setToken(token);

const deployCommands = async () => {
  try {
    console.log("Started refreshing application (/) commands.");

    const configPath = join(__dirname, "config.json");
    const data = readFileSync(configPath);
    const { guildIds = [] } = JSON.parse(data);

    for (const guildId of guildIds) {
      console.log(`Deploying commands to guild ID: ${guildId}`);
      await rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: commands });
    }

    console.log("Successfully reloaded application (/) commands.");
  } catch (error) {
    console.error("Error deploying commands:", error);
  }
};

deployCommands();

module.exports = commands;
