const { clientId, guildIds, token } = require("./config.json");
const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v10");

const rest = new REST({ version: "10" }).setToken(token);

guildIds.forEach((guildId) => {
  rest
    .put(Routes.applicationGuildCommands(clientId, guildId), { body: [] })
    .then(() =>
      console.log(
        `Successfully deleted all guild commands for guild ${guildId}.`
      )
    )
    .catch(console.error);
});
