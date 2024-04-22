const { Events } = require("discord.js");

// The name property states which event this file is for
// The once property holds a boolean value that specifies if the event should run only once
// The execute function holds event logic, which will be called by the event handler
module.exports = {
  name: Events.ClientReady,
  once: true,
  execute(client) {
    console.log(`Ready! Logged in as ${client.user.tag}`);
  },
};
