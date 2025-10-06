const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, Events, GatewayIntentBits, EmbedBuilder, MessageFlags } = require('discord.js');
require('dotenv').config();
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.MessageContent] });
const Shift = require('./utility/shift-handle');
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
			const shift = await Shift.get(id);
			const broadcastMessage = await interaction.guild.channels.cache.get(shiftBroadcastChannel).messages.fetch(shift.broadcastMessageId);
			if (action === "acceptShift") {
				Shift.start(id, interaction.member);
				await interaction.reply({ content: `Task **${shift.title}** started!`, flags: MessageFlags.Ephemeral });
			}
			else if (action === "declineShift") {
				Shift.reject(id, interaction.user);
				const updatesChannel = interaction.guild.channels.cache.get(shiftUpdatesChannel);
				if (!updatesChannel) {
					return interaction.channel.send('❌ Task broadcast channel not found!');
				}
				let alert = await updatesChannel.send({ content: `${interaction.user} has rejected task **${shift.title}**, please reply to this message to log reason.` });
				await interaction.reply({ content: `Task **${shift.title}** has been rejected, please log a reason for rejecting this task at ${alert.url}`, flags: MessageFlags.Ephemeral });
			} else if(action === "completeShift") {
				Shift.completed(id, interaction.user);
				await interaction.reply({ content: `Task **${shift.title}** has been completed!`, flags: MessageFlags.Ephemeral });
			} else if(action === "pauseShift") {
				Shift.pause(id)
			}

		} catch (error) {
			console.error(error);
			await interaction.reply({ content: "Button error!", flags: MessageFlags.Ephemeral });
		}
	}
});

client.login(process.env.token);