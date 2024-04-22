const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ban")
    .setDescription("Select a member and ban them.")
    .addUserOption((option) =>
      option
        .setName("target")
        .setDescription("The member to ban")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option.setName("reason").setDescription("The reason for the ban")
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
    .setDMPermission(false),
  async execute(interaction) {
    const target = interaction.options.getUser("target");
    const reason = interaction.options.getString("reason");

    const confirm = new ButtonBuilder()
      .setCustomId("confirm")
      .setLabel("Confirm Ban")
      .setStyle(ButtonStyle.Danger);

    const cancel = new ButtonBuilder()
      .setCustomId("cancel")
      .setLabel("Cancel")
      .setStyle(ButtonStyle.Secondary);

    const row = new ActionRowBuilder().addComponents(cancel, confirm);

    const response = await interaction.reply({
      content: `Are you sure you want to bad ${target} for reason: ${reason}?`,
      components: [row],
    });

    // This is an arrow function named collectorFilter
    // This function takes one paramter 'i' and compares the 'id' property of the 'user' property of the 'i' object
    // with the 'id' property of the 'user' property of the 'interaction' object
    const collectorFilter = (i) => i.user.id === interaction.user.id;
    console.log(collectorFilter);

    // Method returns a promise that resolves when any interaction passes its filter (if one is provided)
    // or throws if none are received before the timeout - if this happens, remove the components and notify user
    //
    // The filter applied here ensures that only the user who triggered the original interaction can use the buttons.
    try {
      console.log("waiting to receive response");
      const confirmation = await response.awaitMessageComponent({
        filter: collectorFilter,
        time: 60_000,
      });

      // With the confirmation collected, check which button was clicked and perform appropriate action.
      if (confirmation.customId === "confirm") {
        await interaction.guid.members.ban(target);
        await confirmation.update({
          content: `${target.username} has been banned for reason: ${reason}`,
          components: [],
        });
      } else if (confirmation.customId === "cancel") {
        console.log("cancel button clicked");
        await confirmation.update({
          content: "Action cancelled",
          components: [],
        });
      }
    } catch (e) {
      // throws if no interaction is received before timeout
      await interaction.editReply({
        content: "Confirmation not received within 1 minute, cancelling",
        components: [],
      });
    }
  },
};
