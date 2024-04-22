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

## 3 - Additional Modules

- The `fs` module is Node's native file system module. It is used to read the `commands` directory and identify our command files.
- The `path` module is Node's native path utility module. It helps construct paths to access files and directories. One of the advantages of the `path` module is that it automatically detects the operating system and uses the approporiate joiners.
- The `Collection` class extends JavaScript's native `Map` class, and inclodes more extensive and useful functionality. It is used to store and efficiently retrieve commands for execution.

## 4 - Slash command response methods

### Ephemeral responses

Discord provides a way to hide response messages from everyone but the executor of the slash command. This type of message is called an `ephemeral` message and can be set by providing `ephemeral: true` in the `InteractionReplyOptions`, as follows:

    await interaction.reply({ content: "Secret Pong!", ephemeral: true });

### Editing responses

After an initial response has been sent, you may want to edit that response for various reasons. This can be achieves with the `editReply()` method.

> [!WARNING]
> After the initial response, an interaction token is valid for 15 minutes, so this is the timeframe in which you can edit the response and send follow-up messages. You also cannot edit the ephemeral state of a message, so ensure that your first response sets this correctly.

    if (interaction.commandName === 'ping') {
    	await interaction.reply('Pong!');
    	await wait(2_000);
    	await interaction.editReply('Pong again!');
    }

### Deferred Responses

As explained above, Discord requires an acknowledgement from the bot within three seconds that the interaction was received. If this acknowledgement is not received, Discord considers the interaction to have failed and the token becomes invalid. Some commands, however, will perform tasks that require longer than three seconds to complete.

In this case, we use the `deferReply()` method, which triggers the `<application> is thinking...` message. This also acts as the intial response, confirming to discord that the interaction was received successfully and gives you a **15 minute timeframe** to complete your tasks before responding.

    if (interaction.commandName === 'ping') {
    	await interaction.deferReply();
    	await wait(4_000);
    	await interaction.editReply('Pong!');
    }

### Follow-ups

Both the above responses are _initial_ responses. Additional messages can be sent using the `followUp()` method. These can be made into ephemeral responses and also manipulated with the `wait()` command.

> [!TIP]
> Interaction responses can use masked links (e.g. `[text](http://site.com)`) in the message content.

### Fetching and deleting responses

In addition to replying to a slash command, you make also want to delete the initial reply. For this, we use the `deleteReply()` method:

    await interaction.reply('Pong!');
    await interaction.deleteReply();

Similarly, we make retrieve the `Message` object of a reply for various reasons, such as adding reactions. For this, we use the `fetchReply()` method, as below:

    await interaction.reply('Pong!');
    const message = await interaction.fetchReply();
    console.log(message);

## 5 - Advanced command creation
