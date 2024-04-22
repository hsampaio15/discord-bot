# Tips from discordjs.guide

## 1 - Fully functional slash commands

For fully functional slash commands, there are three impoortant pieces of code that need to be written. They are:

1. The individual command files, containing their definitions and functionality.
2. The **command handler**, which dynamically reads the files and executes the commands.
3. The **command deployment script**, to register your slash commands with Discord so they appear in the interface.

These steps can be done in any order, but **all are required** before the commands are fully functional.

## 2 - Module Exports

`module.exports` is how you export data in Node.js so that you can `require()` it in other files.

If you need to access your client instance from inside a command file, you can access it via `interaction.client`. If you need to access external files, packages, etc., you should `require()` them at the top of the file.
