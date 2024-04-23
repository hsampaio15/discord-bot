/**
 *
 * @param {*} client The Bot client
 * @param {*} guildId The server ID (if it exists)
 * @returns
 */
module.exports = async (client, guildId) => {
  let applicationCommands;

  // if guildId exists, get commands inside that specific guild
  if (guildId) {
    const guild = await client.guilds.fetch(guildId);
    applicationCommands = guild.commands;
  } else {
    // else, get global commands (owned by client)
    applicationCommands = await client.application.commands;
  }

  // have to be fetched at once
  await applicationCommands.fetch();
  return applicationCommands;
};
