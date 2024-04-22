const {
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  SlashCommandBuilder,
  ActionRowBuilder,
  ComponentType,
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("poke")
    .setDescription("Pokemon menu selecter test"),
  async execute(interaction) {
    const select = new StringSelectMenuBuilder()
      .setCustomId("starter")
      .setPlaceholder("Make a selection!")
      .addOptions(
        new StringSelectMenuOptionBuilder()
          .setLabel("Bulbasaur")
          .setDescription("The dual-type Grass/Poison Seed Pokemon.")
          .setValue("bulbasaur"),
        new StringSelectMenuOptionBuilder()
          .setLabel("Charmander")
          .setDescription("The Fire-type Lizard Pokemon.")
          .setValue("charmander"),
        new StringSelectMenuOptionBuilder()
          .setLabel("Squirtle")
          .setDescription("The Water-type Tiny Turtle Pokemon.")
          .setValue("squirtle")
      );

    // Sending select menus and store InteractionResponse as variable
    const row = new ActionRowBuilder().addComponents(select);
    const response = await interaction.reply({
      content: "Choose your starter!",
      components: [row],
    });

    // createMessageComponentCollector() method returns an InteractionCollector that will fire its
    // InteractionCollector#event:collect event whenever an interaction passes its filter (if one is provided)
    const collector = response.createMessageComponentCollector({
      componentType: ComponentType.StringSelect,
      time: 3_600_000,
    });

    // ! in the collect event, each iteration is a StringSelectMenuInteraction thanks to the
    // ! "componentType: ComponentType.StringSelect" option provided to the collector above
    // The selected values are available via the #values property
    collector.on("collect", async (i) => {
      const selection = i.values[0];
      await i.reply(`${i.user} has selected ${selection}!`);
      response.components = [];
    });
  },
};
