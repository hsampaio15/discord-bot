const { SlashCommandBuilder, ChannelType } = require("discord.js");

module.exports = {
  cooldown: 3,
  data: new SlashCommandBuilder()
    .setName("echo")
    .setDescription("Replies with your input!")
    .addStringOption((option) =>
      option
        .setName("input")
        .setDescription("The input to echo back")
        .setMaxLength(2000)
    )
    .addChannelOption((option) =>
      option
        .setName("channel")
        .setDescription("The channel to echo into")
        .addChannelTypes(ChannelType.GuildText)
    )
    .addBooleanOption((option) =>
      option
        .setName("embed")
        .setDescription("Whether or not the echo should be embedded")
    ),
  async execute(interaction) {
    await interaction.reply("Pong!");
    const message = await interaction.fetchReply();
    console.log(message.content);
  },
};
