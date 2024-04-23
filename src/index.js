require("dotenv").config();
const { Client, GatewayIntentBits, ActivityType } = require("discord.js");

// Create a new client instance
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessages,
  ],
});

// event listener for event 'ready'
client.on("ready", (c) => {
  console.log(`🐔 ${client.user.tag} is online.`);

  client.user.setActivity({
    name: "quak quak",
    type: ActivityType.Custom,
  });
});

client.login(process.env.TOKEN);
