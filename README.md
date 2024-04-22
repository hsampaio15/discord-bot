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

### Adding options

Application commands can have additional options. Think of these options are argument to a function, and as a way for the user to provide the additional information the command requires.

Options require, at minimum, a name and description, with the same restrictions that apply to slash command names. You can specify them as shwon in the `echo` command below, which prompt the user to enter a String for the `input` option.

    const data = new SlashCommandBuilder()
    .setName('echo')
    .setDescription('Replies with your input!')
    .addStringOption(option =>
    	option.setName('input')
    		.setDescription('The input to echo back'));

### Option types

By specifying the `type` of an option using the corresponding method, you are able to restrict what the user can provide as input, and for some options leverage the automatic parsing of options into proper objects by Discord.

The example above used the `addStringOption` type, but there are several types:

- `String`, `Integer`, `Number` and `Boolean` options all accept primitive values of their associated type.
  - `Integer` only accepts whole numbers.
  - `Number` accepts both whole numbers and decimals.
- `User`, `Channel`, `Role` and `Mentionable` options will show a selection list in the Discord interface for their associated type, or will accept a Snowflake (id) as input.
- `Attachment` options prompt the user to make an upload along with the slash command.
- `Subcommand` and `SubcommandGroup` options allow you to have branching pathways of subsequent options for your commands - more on that later.

### Required options and further validation

With option types covered, you can start looking at forms of validation to ensure data your bot receives is both complete and accurate. The simplest addition is making options required, to ensure the command cannot be executed without a required value. This can be applied to options of any type. In the `echo` example again, we use `setRequired(true)` to make the `input` option as required.

    const data = new SlashCommandBuilder()
    .setName('echo')
    .setDescription('Replies with your input!')
    .addStringOption(option =>
    	option.setName('input')
    		.setDescription('The input to echo back')
    		.setRequired(true));

We can also specify `choices` for the `String`, `Number` and `Integer` types if a selection from a set of predetermined values is preferred. This is particularly useful when dealing with external datasets, APIs and similar, where specific input formats are required.

We specify choices by using the `addChoices()` method from within the option builder. These require a `name` and a `value` that the bot will receive when that choice is selected. The `gif` command example below allows users to select from predetermined categories of gifs to send:

    const data = new SlashCommandBuilder()
    .setName('gif')
    .setDescription('Sends a random gif!')
    .addStringOption(option =>
    	option.setName('category')
    		.setDescription('The gif category')
    		.setRequired(true)
    		.addChoices(
    			{ name: 'Funny', value: 'gif_funny' },
    			{ name: 'Meme', value: 'gif_meme' },
    			{ name: 'Movie', value: 'gif_movie' },
    		));

If we want an intermediate level of restrictions in place, we can exercise the following restrictions on free inputs:

- `setMaxLength()` and `setMinLength()` can enforce length limitations for `String` options.
- `setMaxValue()` and `setMindValue()` can enforce range limitations on the value of `Integer` and `Number` options.
- `addChannelTypes()` can restrict selection to specific channel types, such as `ChannelType.GuildText`, for `Channel` options.

## 6 - Parsing options

### Command Options

In this section, we will cover how to access the values of command's options. Consider the following `ban` command example with two options:

    module.exports = {
    data: new SlashCommandBuilder()
    	.setName('ban')
    	.setDescription('Select a member and ban them.')
    	.addUserOption(option =>
    		option
    			.setName('target')
    			.setDescription('The member to ban')
    			.setRequired(true))
    	.addStringOption(option =>
    		option
    			.setName('reason')
    			.setDescription('The reason for banning'))
    	.setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
    	.setDMPermission(false),
    };

In the execute method, you can retrieve the value of these two options from the `CommandInteractionOptionResolver` as show below:

    module.exports = {
    // data: new SlashCommandBuilder()...
    async execute(interaction) {
    	const target = interaction.options.getUser('target');
    	const reason = interaction.options.getString('reason') ?? 'No reason provided';

    	await interaction.reply(`Banning ${target.username} for reason: ${reason}`);
    	await interaction.guild.members.ban(target);
    },
    };

Since `reason` isn't a require option, the example above uses the `??` [nullish coalescing operator](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Nullish_coalescing) to set a default value in the case the user does not supply a value for `reason`.

If the target user is still in the guild where the command is being run, you can also use `.getMember('target')` to get their full `GuildMember` object.

> [!TIP]
> If you want the Snowflake of a structure instead, grab the object via `get()` and access the snowflake via the `value` property. Note that you should use `const { value: name } = ...` here to [destructure and rename](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment) the value obtained from the [`CommandInteractionOption'](https://old.discordjs.dev/#/docs/discord.js/14.14.1/typedef/CommandInteractionOption) structure to avoid identifier name conflicts.

In the same way as the above examples, you can get values of any type using the corresponding `CommandInteractionOptionResolver#get_____()` method.

### Choices

If you specified preset choices for your options, getting the selected choice is exactly the same as above. Consider the gif command example from earlier:

    module.exports = {
    data: new SlashCommandBuilder()
    	.setName('gif')
    	.setDescription('Sends a random gif!')
    	.addStringOption(option =>
    		option.setName('category')
    			.setDescription('The gif category')
    			.setRequired(true)
    			.addChoices(
    				{ name: 'Funny', value: 'gif_funny' },
    				{ name: 'Meme', value: 'gif_meme' },
    				{ name: 'Movie', value: 'gif_movie' },
    			)),
    async execute(interaction) {
    	const category = interaction.options.getString('category');
    	// category must be one of 'gif_funny', 'gif_meme', or 'gif_movie'
        },
    };

Note that nothing changes - you still use `getString()` to get the choice value. The only difference is that in this case, you can be sure it's one of only three possible values.

## 7 - Slash command permissions

Slash commands have their own permissions systems. This system allows you to se the default level of permissions required for a user to execute a command when it is first deployed or your bot is added to a new server.

These are defaults only and can be altered by guild admins, allowing them to configure access however best suits their moderation and server roles. Your code should not try to enforce its own permission management, as this can result in a conflict between the server-configured permissions and your bot's code.

For a ban command, a sensible default is to ensure that users already have the Discord permission `BanMembers` in order to use it. Likewise, for a kick command, we can allow memebers with the `KickMembers` premission to execute the command.

> [!TIP]
> You can require the user to hvae all of multiple permissions by merging them with the `|` bitwise OR operators (for example `PremissionFlagsBits.BanMembers | PermissionFlagsBits.KickMembers`)

### DM permission

By default, globally deployed commands are also availabe for use in DMs. You can use [`SlashCommandBuilder#setDMPermission()`](https://discord.js.org/docs/packages/builders/1.7.0/SlashCommandBuilder:Class#setDMPermission) to disable this behaviour. Commands deployed to specific guilds are not available in DMs.

It doesn't make much sense for the `ban` command to be available in DMs, so you can add `setDMPermission(false)` to the builder to remove it.

## 8 - Autocomplete

### Enabling autocomplete

To enable autocomplete with your commands, _instead_ of listing static choices, the option must be set to use autocompletion using `SlashCommandStringOption#setAutocomplete()`:

    	module.exports = {
    cooldown: 5,
    data: new SlashCommandBuilder()
    	.setName("guide")
    	.setDescription("Search discordjs.guide!")
    	.addStringOption((option) =>
    	option
    		.setName("query")
    		.setDescription("Phrase to search for")
    		.setAutocomplete(true)
    	),
    async autocomplete(interaction) {
    	// handle the autocompletion response (more on how to do that below)
    },
    async execute(interaction) {
    	// respond to the complete slash command
    },
    };

### Responding to autocomplete interactions

To handle an `AutocompleteInteraction`, use the `BaseInteraction#isAutocomplete()` type guard to make sure the interaction instance is an autocomplate interaction. You can do this in a separate `interactionCreate` listener:

    client.on(Events.InteractionCreate, interaction => {
    if (!interaction.isAutocomplete()) return;
    // do autocomplete handling
    });

Or alternatively, by making a small change to your existing Command handler and adding an additional method to your individual command files.

### Sending results

The `AutocompleteInteraction` class provides the `respond()` method to send a response. Using this, you can submit an array of `ApplicationCommandOptionChoiceData` objects for the user to choose from. Passing an emptry array will show "Mo options match your search" for the user.

The `CommandInteractionOptionResolver#getFocused()` method returns the currently focused option's value, which can be used to apply filtering to the choices presented. For example, to only display options starting with the focused value, you can use the `Array#filter()` method, then using `Array#map()`, you can transform the array into an array of `ApplicationCommandOptionChoiceData` objects.

    module.exports = {
    cooldown: 5,
    data: new SlashCommandBuilder()
    	.setName("guide")
    	.setDescription("Search discordjs.guide!")
    	.addStringOption((option) =>
    	option
    		.setName("query")
    		.setDescription("Phrase to search for")
    		.setAutocomplete(true)
    	),
    async autocomplete(interaction) {
    	const focusedValue = interaction.options.getFocused();
    	const choices = [
    	"Popular Topics: Threads",
    	"Sharding: Getting started",
    	"Library: Voice Connections",
    	"Interactions: Replying to slash commands",
    	"Popular Topics: Embed preview",
    	];
    	const filtered = choices.filter((choice) =>
    	choice.startsWith(focusedValue)
    	);
    	await interaction.respond(
    	filtered.map((choice) => ({ name: choice, value: choice }))
    	);
    },
    async execute(interaction) {
    	// respond to the complete slash command
    },
    };

### Handling multple autocomplete options

To distinguish between multiple options, you can pass `true` into `getFocused()`, which will now return the full focused object instead of just a value. This is used to get the name of the focused option below, allowing for multiple options to each have their own set of suggestions.

    async autocomplete(interaction) {
    	const focusedOption = interaction.options.getFocused(true);
    	let choices;

    	if (focusedOption.name === 'query') {
    		choices = ['Popular Topics: Threads', 'Sharding: Getting started', 'Library: Voice Connections', 'Interactions: Replying to slash commands', 'Popular Topics: Embed preview'];
    	}
