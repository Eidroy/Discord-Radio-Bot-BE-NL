const { joinVoiceChannel, VoiceConnectionStatus, AudioPlayerStatus, createAudioPlayer, createAudioResource } = require("@discordjs/voice");
const axios = require("axios");

async function handleMusicCommand(interaction, streamUrl, stationName, guildStates) {
  try {
    if (!interaction.member?.voice?.channel) {
      return interaction.reply("You need to be in a voice channel to play music!");
    }

    const voiceChannel = interaction.member.voice.channel;

    const connection = joinVoiceChannel({
      channelId: voiceChannel.id,
      guildId: voiceChannel.guild.id,
      adapterCreator: voiceChannel.guild.voiceAdapterCreator,
    });

    const player = createAudioPlayer();
    guildStates.set(interaction.guild.id, { connection, player, textChannelId: interaction.channel.id });

    connection.on(VoiceConnectionStatus.Ready, async () => {
      console.log("The bot has connected to the channel!");
      await interaction.deferReply();
      await interaction.editReply("Joined your voice channel! Playing music...");

      const response = await axios({ url: streamUrl, method: "GET", responseType: "stream" });

      const resource = createAudioResource(response.data);
      player.play(resource);
      connection.subscribe(player);

      player.on(AudioPlayerStatus.Playing, () => console.log("The audio player has started playing!"));
      player.on(AudioPlayerStatus.Idle, () => {
        console.log("The audio player is idle!");
        connection.destroy();
      });

      await interaction.editReply(`Playing ${stationName}!`);
    });

    connection.on(VoiceConnectionStatus.Disconnected, async () => {
      console.log("The bot has disconnected from the channel.");
      const guildId = interaction.guild.id;
      const guildState = guildStates.get(guildId);

      if (guildState) {
        guildStates.delete(guildId);

        try {
          await handleMusicCommand(interaction, streamUrl, stationName, guildStates);
        } catch (error) {
          console.error(`Failed to reconnect for guild ${guildId}:`, error);
          await interaction.followUp("Failed to reconnect. Stopping playback.");
        }
      }
    });
  } catch (error) {
    console.error("Error handling music command:", error);
    await interaction.reply("Failed to play music.");
  }
}

async function handleDisconnectCommand(interaction, guildStates) {
  await interaction.deferReply();

  try {
    const connection = joinVoiceChannel({
      channelId: interaction.member.voice.channel.id,
      guildId: interaction.member.voice.channel.guild.id,
      adapterCreator: interaction.member.voice.channel.guild.voiceAdapterCreator,
    });

    if (!connection) {
      return interaction.reply("The bot is not in a voice channel.");
    }

    connection.destroy();
    guildStates.delete(interaction.guild.id);
    await interaction.followUp("Disconnecting from voice channel...");
  } catch (error) {
    console.error("Error disconnecting:", error);
    await interaction.reply("Failed to disconnect from voice channel.");
  }
}

async function handleInviteCommand(interaction) {
  await interaction.deferReply();

  try {
    const inviteLink = `https://discord.com/oauth2/authorize?client_id=1253672735087788222`;
    await interaction.editReply(`[Invite the bot to your server](${inviteLink})`);
  } catch (error) {
    console.error("Error handling invite command:", error);
    await interaction.editReply("Failed to get invite link.");
  }
}

module.exports = { handleMusicCommand, handleDisconnectCommand, handleInviteCommand };