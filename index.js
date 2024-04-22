const fs = require("node:fs");
const path = require("node:path");
const { Client, Collection, Events, GatewayIntentBits } = require("discord.js");
const { token } = require("./config.json");

// Create a new client instance
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.cooldowns = new Collection();
client.commands = new Collection();

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
//////////////////////////////////////////////////

// Dynamically retrieve all the event files in the ./events/ folder, similarly to above.
// Client class in discord.js extends the EventEmitter class, therefore the client object exposes the .on() and .once()
// methods that you can use to register event listeners - these take two arguements, the name and callback function.
const eventsPath = path.join(__dirname, "events");
const eventFiles = fs
  .readdirSync(eventsPath)
  .filter((file) => file.endsWith(".js"));

// Callback function collects arguments in args array using '...' rest parameter syntax, then calls event.execute()
// while passing in the args array using the '...' spread syntax. These are used becuase different events in discord.js
// have different numbers of arguments.
for (const file of eventFiles) {
  const filePath = path.join(eventsPath, file);
  const event = require(filePath);
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args));
  } else {
    client.on(event.name, (...args) => event.execute(...args));
  }
}

// Log in to Discord with your client's token
client.login(token);
