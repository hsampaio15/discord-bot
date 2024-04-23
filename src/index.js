require("dotenv").config();
const { gptChannels } = require("../config.json");
const { OpenAI } = require("openai");

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

const openai = new OpenAI({
  apiKey: process.env.OPENAI_KEY,
});

client.openai = openai;

eventHandler(client);

client.login(process.env.TOKEN);
