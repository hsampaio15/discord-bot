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
        .setRequired(true)
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
    const input = interaction.options.getString("input");
    await interaction.reply(input);
  },
};
