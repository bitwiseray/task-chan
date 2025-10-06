const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, Events, GatewayIntentBits, EmbedBuilder, MessageFlags } = require('discord.js');
require('dotenv').config();
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.MessageContent] });
const Shift = require('./utility/shift-handle');
const ShiftInteraction = require('./utility/shift-interaction');
const { shiftUpdatesChannel, shiftBroadcastChannel } = require('./config.json');

client.commands = new Collection();

client.once(Events.ClientReady, readyClient => {
	console.log(`Ready! Logged in as ${readyClient.user.tag}`);
});

const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
	const commandsPath = path.join(foldersPath, folder);
	const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const command = require(filePath);
		if ('data' in command && 'execute' in command) {
			client.commands.set(command.data.name, command);
		} else {
			console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
		}
	}
}

client.on(Events.InteractionCreate, async interaction => {
	if (interaction.isChatInputCommand()) {
		const command = interaction.client.commands.get(interaction.commandName);
		if (!command) {
			console.error(`No command matching ${interaction.commandName} was found.`);
			return;
		}
		try {
			await command.execute(interaction);
		} catch (error) {
			console.error(error);
			const reply = { content: 'There was an error while executing this command!', ephemeral: true };
			if (interaction.replied || interaction.deferred) await interaction.followUp(reply);
			else await interaction.reply(reply);
		}
	}

	else if (interaction.isButton()) {
		try {
			const [action, id] = interaction.customId.split(":");
			if (!id) return;
			const broadcastMessage = await interaction.guild.channels.cache
			.get(shiftBroadcastChannel)
			.messages.fetch(shift.broadcastMessageId);
			const handler = new ShiftInteraction(interaction, shift, broadcastMessage);

			switch (action) {
			case "acceptShift": await handler.accept(); break;
			case "declineShift": await handler.reject(); break;
			}
		} catch (error) {
			console.error(error);
			await interaction.reply({ content: "Button error!", flags: MessageFlags.Ephemeral });
		}
	}
});

client.login(process.env.token);