require("dotenv").config();
const { Client, GatewayIntentBits } = require("discord.js");

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
});

// event listener for event 'messageCreate'
client.on("messageCreate", (message) => {
  // exit method if the message author is a bot
  if (message.author.bot) return;

  // reply to a hello message
  if (message.content === "hello") {
    message.reply("Hey!");
  }
});

client.login(process.env.TOKEN);
