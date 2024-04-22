// Require the necessary discord.js classes
const { Client, Collection, Events, GatewayIntentBits } = require("discord.js");

const fs = require("node:fs");
const path = require("node:path");
const { token } = require("./config.json");

// Create a new client instance
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

Client.commands = new Collection();

////////////////////////////////////////////
// Dynamically retrieve the command files
////////////////////////////////////////////

// path.join construct path to the commmands directory
const foldersPath = path.join(__dirname, "commands");

// first fs.readdirSync reads the path to the directory and returns an array of
//    all the folder names it contains
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
  const commandsPath = path.join(foldersPath, folder);

  // second fs.readdirSync reads the path to the directory and returns an array of all file names they contain
  // currently, ['ping.js', 'server.js', 'user.js']
  // filters out any non-JS files from array
  const commandFiles = fs
    .readdirSync(commandsPath)
    .filter((file) => file.endsWith(".js"));
  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    // Set a new item in the collection with key=command_name and value=exported module
    if ("data" in command && "execute" in command) {
      client.commands.set(command.data.name, command);
    } else {
      console.log(
        `[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`
      );
    }
  }
}

// When the client is ready, run this code (only once).
// The distinction between 'client: Client<boolean>' and 'readyClient: Client<true>'
//    is important for TypeScript developers
client.once(Events.ClientReady, (readyClient) => {
  console.log("Ready! Logged in as ${readyClient.user.tag}");
});

// Log in to Discord with your client's token
client.login(token);

// Executes code when the app receives an interaction
client.on(Events.InteractionCreate, (interaction) => {
  if (!interaction.isChatInputCommand()) return;
  console.log(interaction);
});
