const { Client, GatewayIntentBits } = require("discord.js");
const { token } = require("./config.json");
const { handleMusicCommand, handleDisconnectCommand, handleInviteCommand } = require("./commands");
const { readConfig, writeConfig } = require("./config");
const { spawn } = require("child_process");
const { join } = require("path");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.MessageContent,
  ],
});

const guildStates = new Map();

async function startBot() {
  try {
    const deployProcess = spawn("node", [join(__dirname, "deploy-commands.js")], { stdio: "inherit" });

    deployProcess.on("exit", async (code) => {
      if (code === 0) {
        console.log("Successfully deployed application (/) commands.");
        await client.login(token);
        console.log("Bot is logged in and ready!");
      } else {
        console.error(`Failed to deploy commands. Exit code: ${code}`);
        process.exit(1);
      }
    });
  } catch (error) {
    console.error("Error starting bot:", error);
    process.exit(1);
  }
}

async function restartBot() {
  console.log("Restarting bot...");

  client.destroy();

  const configPath = join(__dirname, "config.json");
  try {
    const config = await readConfig(configPath);

    if (!config.guildIds) {
      config.guildIds = [];
    }

    await writeConfig(configPath, config);
    await startBot();
  } catch (error) {
    console.error("Error restarting bot:", error);
    process.exit(1);
  }
}

client.on("guildCreate", async (guild) => {
  console.log(`Joined new guild: ${guild.name} (ID: ${guild.id})`);

  const configPath = join(__dirname, "config.json");

  try {
    const config = await readConfig(configPath);

    if (!config.guildIds) {
      config.guildIds = [];
    }

    if (!config.guildIds.includes(guild.id)) {
      config.guildIds.push(guild.id);
      await writeConfig(configPath, config);
      console.log(`Added ${guild.id} to guildIds in config.`);

      const deployProcess = spawn("node", [join(__dirname, "deploy-commands.js")]);

      deployProcess.on("exit", (code) => {
        if (code === 0) {
          console.log("Successfully reloaded application (/) commands.");
          restartBot();
        } else {
          console.error(`Failed to deploy commands for new guild. Exit code: ${code}`);
        }
      });
    }
  } catch (error) {
    console.error("Error handling guild create event:", error);
  }
});

client.once("ready", () => {
  console.log("Ready!");
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isCommand()) return;

  const commands = {
    top: ["https://playerservices.streamtheworld.com/api/livestream-redirect/TOP_RADIO.mp3?dist=website", "TOP Radio"],
    mnm: ["https://vrt.streamabc.net/vrt-mnm-mp3-128-9205274?sABC=66758667%230%232s9qq0sp8634o15q55r718qo65q2rnpo%23&aw_0_1st.playerid=&amsparams=playerid:;skey:1718978151", "MNM"],
    qmusic: ["https://icecast-qmusicbe-cdp.triple-it.nl/qmusic.mp3", "Q-Music"],
    stubru: ["https://vrt.streamabc.net/vrt-studiobrussel-mp3-128-4409118?sABC=667591p0%230%232s9qq0sp8634o15q55r718qo65q2rnpo%23&aw_0_1st.playerid=&amsparams=playerid:;skey:1718981056", "Studio Brussel"],
    fg: ["https://n36a-eu.rcs.revma.com/5wesqhfap98uv?rj-ttl=5&rj-tok=AAABkDuQVQcAAQkszcRlLcNxEw", "FG Radio"],
    slam: ["https://playerservices.streamtheworld.com/api/livestream-redirect/SLAM_MP3.mp3", "SlamFM"],
    radio538: ["https://21633.live.streamtheworld.com/RADIO538.mp3", "Radio 538"],
    qmusicnl: ["https://stream.qmusic.nl/qmusic/aachigh", "Q-Music NL"],
    sky: ["https://www.mp3streams.nl/zender/skyradio/stream/8-mp3-128", "Sky Radio"],
  };

  if (commands[interaction.commandName]) {
    await handleMusicCommand(interaction, ...commands[interaction.commandName], guildStates);
  } else if (interaction.commandName === "disconnect") {
    await handleDisconnectCommand(interaction, guildStates);
  } else if (interaction.commandName === "invite") {
    await handleInviteCommand(interaction);
  } else {
    await interaction.reply({ content: "Unknown command. Please try again.", ephemeral: true });
  }
});

module.exports = { startBot, restartBot, client, guildStates };