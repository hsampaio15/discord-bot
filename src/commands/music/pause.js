const { Client, Interaction } = require("discord.js");
const {} = require("@discordjs/voice");
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
      client.audioPlayer.pause();
    } catch (error) {
      console.log(
        `Encountered an error attempting to pause the audio player: ${error}`
      );
    }

    await interaction.editReply("Music paused.");
  },

  name: "pause",
  description: "Make the bot pause the music",
};
