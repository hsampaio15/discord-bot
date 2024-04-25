const {
  Client,
  Interaction,
  ApplicationCommandOptionType,
  ChannelType,
  EmbedBuilder,
} = require("discord.js");
const {
  joinVoiceChannel,
  getVoiceConnections,
  createAudioPlayer,
  createAudioResource,
  AudioPlayerStatus,
} = require("@discordjs/voice");
const path = require("path");
const ytdl = require("ytdl-core");
const google = require("googleapis");
require("dotenv").config();

module.exports = {
  /**
   *
   * @param {Client} client
   * @param {Interaction} interaction
   */
  callback: async (client, interaction) => {
    await interaction.deferReply();
    const voiceChannel = interaction.member.voice.channel;
    const youtubeUrl = interaction.options.getString("url");
    const embed = new EmbedBuilder();

    // event emitter
    const voiceConnection = joinVoiceChannel({
      channelId: voiceChannel.id,
      guildId: interaction.guild.id,
      adapterCreator: interaction.guild.voiceAdapterCreator,
      selfDeaf: false,
    });

    // audio player and voiceConnection fire
    if (!client.audioPlayer && !client.voiceConnection) {
      console.log("Client doesnt have audio or voice connection.");
      client.voiceConnection = voiceConnection;
      const audioPlayer = createAudioPlayer();
      client.audioPlayer = audioPlayer;

      // event listeners fired only once
      client.voiceConnection.on("stateChange", (oldState, newState) => {
        console.log(
          `Connection transitioned from ${oldState.status} to ${newState.status}`
        );
      });

      client.audioPlayer.on("stateChange", (oldState, newState) => {
        console.log(
          `Audio player transitioned from ${oldState.status} to ${newState.status}`
        );
      });
    }

    // check if the url is a valid youtube url
    if (ytdl.validateURL(youtubeUrl)) {
      // Download audio from the YouTube link and create an audio resource
      const stream = ytdl(youtubeUrl, { filter: "audioonly" });
      const audioResource = createAudioResource(stream);

      if (
        client.audioPlayer.state.status === AudioPlayerStatus.Paused ||
        client.audioPlayer.state.status === AudioPlayerStatus.AutoPaused
      ) {
        client.audioPlayer.unpause();
      } else {
        client.audioPlayer.play(audioResource);
      }

      const audioSubscription = client.voiceConnection.subscribe(
        client.audioPlayer
      );

      // fetch video information
      const videoInfo = await getVideoInfo(youtubeUrl, client);

      embed
        .setColor(0x0099ff)
        .setTitle(videoInfo.title)
        .setURL(youtubeUrl)
        .setDescription(videoInfo.description.substring(0, 500))
        .setThumbnail(videoInfo.thumbnails.default.url)
        .setTimestamp();

      await interaction.editReply({ embeds: [embed] });
    } else {
      await interaction.editReply("Invalid YouTube URL.");
    }
  },

  name: "play",
  description: "Make the bot join a voice channel and play music",
  options: [
    {
      name: "url",
      description: "The youtube url",
      type: ApplicationCommandOptionType.String,
    },
  ],
};

// Function to fetch video information
async function getVideoInfo(url, client) {
  try {
    const youtube = client.youtube;
    // Extract video ID from URL
    const videoId = new URL(url).searchParams.get("v");

    // Make API request to fetch video details
    const response = await youtube.videos.list({
      part: "snippet",
      id: videoId,
    });

    // Extract and return snippet data
    const videoSnippet = response.data.items[0].snippet;
    return {
      title: videoSnippet.title,
      description: videoSnippet.description,
      thumbnails: videoSnippet.thumbnails,
    };
  } catch (error) {
    console.error("Error fetching video information:", error);
    return null;
  }
}
