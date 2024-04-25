const {
  Client,
  Interaction,
  ApplicationCommandOptionType,
  ChannelType,
  GuildManager,
} = require("discord.js");
const {
  joinVoiceChannel,
  getVoiceConnections,
  createAudioPlayer,
  createAudioResource,
} = require("@discordjs/voice");
const path = require("path");

module.exports = {
  /**
   *
   * @param {Client} client
   * @param {Interaction} interaction
   */
  callback: async (client, interaction) => {
    await interaction.deferReply();

    try {
      audioPlayer = client.audioPlayer;
      voiceConnection = client.voiceConnection;
      audioPlayer.stop();
      voiceConnection.disconnect();
    } catch (error) {
      console.log(
        `Encountered an error attempting to stop the audio player: ${error}`
      );
    }

    await interaction.editReply("Bot stopped.");
  },

  name: "stop",
  description: "Make the bot stop playing music",
};
