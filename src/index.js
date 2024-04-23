require("dotenv").config();
const { Client, GatewayIntentBits, ActivityType } = require("discord.js");
const eventHandler = require("./handlers/eventHandler.js");

// Create a new client instance
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessages,
  ],
});

eventHandler(client);

client.login(process.env.TOKEN);
