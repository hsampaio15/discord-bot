const { testServer } = require("../../../config.json");
const areCommandsDifferent = require("../../utils/areCommandsDifferent");
const getApplicationCommands = require("../../utils/getApplicationCommands");
const getLocalCommands = require("../../utils/getLocalCommands");

module.exports = async (client) => {
  try {
    const localCommands = getLocalCommands();
    const applicationCommands = await getApplicationCommands(
      client,
      testServer
    );

    // want to loop over local commands and see if they are different to application commands
    for (const localCommand of localCommands) {
      const { name, description, options } = localCommand;

      // assign true if there exists command with same 'name' in both
      const existingCommand = await applicationCommands.cache.find(
        (cmd) => cmd.name === name
      );

      if (existingCommand) {
        // check if command has deleted = true property
        if (localCommand.deleted) {
          await applicationCommands.delete(existingCommand.id);
          console.log(`🗑️ Deleted command ${name}.`);
          continue;
        }

        if (areCommandsDifferent(existingCommand, localCommand)) {
          await applicationCommands.edit(existingCommand.id, {
            description,
            options,
          });

          console.log(`🔧 Edited command ${name}`);
        }
      } else {
        if (localCommand.deleted) {
          console.log(
            `🧱 Skipping registering command ${name} as it's set to delete.`
          );
          continue;
        }

        await applicationCommands.create({
          name,
          description,
          options,
        });

        console.log(`👍 Registered command ${name}`);
      }
    }
  } catch (error) {
    console.log(`There was an error: ${error}`);
  }
};
