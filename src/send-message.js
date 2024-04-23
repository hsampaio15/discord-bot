require("dotenv").config();
const {
  Client,
  GatewayIntentBits,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");

// Create a new client instance
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessages,
  ],
});

const roles = [
  {
    id: "1232322856289828894",
    label: "Red",
    buttonStyle: ButtonStyle.Danger,
  },
  {
    id: "1232323014033539153",
    label: "Green",
    buttonStyle: ButtonStyle.Success,
  },
  {
    id: "1232322982567870514",
    label: "Blue",
    buttonStyle: ButtonStyle.Primary,
  },
];

// event listener for event 'ready'
client.on("ready", async (c) => {
  try {
    const channel = await client.channels.cache.get("1232323566457061470");
    if (!channel) return;

    const row = new ActionRowBuilder();

    //  each role will be called role - we will push a component through this row
    roles.forEach((role) => {
      row.components.push(
        new ButtonBuilder()
          .setCustomId(role.id)
          .setLabel(role.label)
          .setStyle(role.buttonStyle)
      );
    });

    await channel.send({
      content: "Claim or remove a role below",
      components: [row],
    });
    process.exit();
  } catch (error) {
    console.log(error);
  }
});

client.login(process.env.TOKEN);
